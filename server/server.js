const mongoose = require("mongoose")

const Document = require("./db.js")

mongoose.connect(
  "mongodb+srv://realtimetexteditor:7O06wm0ojoKrmzrL@sandbox.xztqd.mongodb.net/?retryWrites=true&w=majority&appName=Sandbox",
  {
  }
);

const io = require("socket.io")(3002, {
  cors: {
    origin: [
      "https://realtime-text-editor-lvnfhy9g4-nguyendonlams-projects.vercel.app",
      "http://localhost:5174",
      "https://realtime-text-editor-flax.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data)

        socket.on("send-changes", (delta) => {
          socket.broadcast.to(documentId).emit("recieve-changes", delta);
        });

        socket.on("save-document", async data => {
          await Document.findByIdAndUpdate(documentId, {data})
        })
    })
})

async function findOrCreateDocument(id) {
  if (!id) { return }

  const document = await Document.findById(id);
  if (document) return document
  return await Document.create({_id: id, data: defaultValue})
}