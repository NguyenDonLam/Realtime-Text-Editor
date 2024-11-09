const io = require("socket.io")(3002, {
  cors: {
    origin: [
      "https://realtime-text-editor-lvnfhy9g4-nguyendonlams-projects.vercel.app",
      "http://localhost:5174",
    ],
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