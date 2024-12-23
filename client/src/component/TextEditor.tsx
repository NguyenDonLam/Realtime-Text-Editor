import Quill from "quill";
import { useCallback, useEffect, useState } from "react";
import "quill/dist/quill.snow.css";
import "../styles/TextEditorStyles.css";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router";
import { Delta } from "quill/core";

const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];
export default function TextEditor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState<Socket>();
  const [quill, setQuill] = useState<Quill>();
  useEffect(() => {
    const s = io("https://realtime-text-editor-1-xlhg.onrender.com");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  // Upon recieving the events
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta: Delta) => {
      quill.updateContents(delta);
    };
    socket.on("recieve-changes", handler);

    return () => {
      socket.off("recieve-changes", handler);
    };
  }, [socket, quill]);

  // Upon changing doc
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta: Delta, oldDelta: Delta, source: string) => {
      if (source != "user") return;
      
      socket.emit("send-changes", delta);
      console.log(oldDelta);
      
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [socket, quill]);

  const wrapperRef = useCallback((wrapper: HTMLDivElement) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);
  return <div className="container" ref={wrapperRef}></div>;
}
