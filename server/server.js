const io = require("socket.io")(3001, {
  cors: {
    origin:
      "https://realtime-text-editor-69qs9s907-nguyendonlams-projects.vercel.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", socket => {
    socket.on("get-document", documentId => {
        const data = "";
        socket.join(documentId);
        socket.emit("load-document", data)

        socket.on("send-changes", (delta) => {
          socket.broadcast.to(documentId).emit("recieve-changes", delta);
        });
    })
})