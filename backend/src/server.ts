import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket.js";


const PORT = Number(process.env.PORT) || 3000;


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
initSocket(io);