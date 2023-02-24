const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const TelegramApi = require("node-telegram-bot-api");

const users = [];
const devices = [];
const bot = new TelegramApi(process.env.TOKEN, { polling: true });
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;
  switch (msg.text) {
    case "/start":
      const index = users.findIndex((id) => id === chatId);
      if (index === -1) {
        users.push({ id: chatId, username });
        return bot.sendMessage(chatId, "you are registred in our community.");
      }
      return bot.sendMessage(chatId, "you are already registred.");
      break;
    case "/show_users":
      return bot.sendMessage(chatId, JSON.stringify(users));
      break;
    default:
      return bot.sendMessage(chatId, "I don't know answer.");
      break;
  }
});

io.on("connection", (socket) => {
  socket.on("join", (address) => {
    devices.push({ id: socket.id, address });
  });
  socket.on("disconnect", async () => {
    const index = users.findIndex((data) => data.id === socket.id);
    const device = devices[index];
    delete devices[index];
    for (const item of users) {
      bot.sendMessage(
        item.id,
        `one of terminal is defectived address ${device.address}`
      );
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`server run in port ${port}`);
});
