const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const math = require("mathjs");
require("dotenv").config();
// Token từ BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Hàm lấy giá tiền điện tử
function getCryptoPrice(symbol) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd,vnd`;
  return axios
    .get(url)
    .then((response) => {
      return {
        usd: response.data[symbol].usd,
        vnd: response.data[symbol].vnd,
      };
    })
    .catch((error) => {
      throw new Error("Không tìm thấy tiền điện tử này.");
    });
}
// Xử lý lệnh /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: "/p bitcoin" }],
        [{ text: "/p ethereum" }],
        [{ text: "/p dogecoin" }],
      ],
      resize_keyboard: true, // Tự động điều chỉnh kích thước bàn phím
      one_time_keyboard: true, // Hiển thị một lần, sau đó ẩn
    },
  };
  const list =
    "\nDanh sách lệnh:\n" +
    "1. /p [coin name] để xem giá (vd: /p bitcoin)\n" +
    "2. /calc [expression] để tính toán (vd: /calc 1+1)\n" +
    "3. /val [amount] [coin name] để xem giá trị (vd: /val 0.5 bitcoin)\n" +
    "4. /donate  để ủng hộ t ";
  bot.sendMessage(
    chatId,
    "Chào mừng bạn đến với Lu vet Price Bot!" + list,
    options
  );
});

// Xử lý lệnh /val
bot.onText(/\/p (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const symbol = match[1].toLowerCase(); // Lấy tên tiền điện tử từ người dùng

  getCryptoPrice(symbol)
    .then((price) => {
      bot.sendMessage(
        chatId,
        `Giá của ${symbol} hiện tại:\n` +
          `- USDT: $${price.usd}\n` +
          `- VND: ${price.vnd}₫`
      );
    })
    .catch((error) => {
      bot.sendMessage(chatId, "Có lỗi xảy ra: " + error.message);
    });
});
bot.onText(/val (\d+(\.\d+)?) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const amount = parseFloat(match[1]);
  const symbol = match[3].toLowerCase();

  getCryptoPrice(symbol)
    .then((price) => {
      const resultUsd = (price.usd * amount).toLocaleString();
      const resultVnd = (price.vnd * amount).toLocaleString();
      bot.sendMessage(
        chatId,
        `Giá trị của ${amount} ${symbol} hiện tại:\n` +
          `- USDT: $${resultUsd}\n` +
          `- VND: ${resultVnd}₫`
      );
    })
    .catch((error) => {
      bot.sendMessage(chatId, "Có lỗi xảy ra: " + error.message);
    });
});
//lệnh tính toán
bot.onText(/\/calc (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const expression = match[1]; // Lấy biểu thức toán học từ người dùng
  try {
    if (isNaN(expression)) {
      const result = math.evaluate(expression).toLocaleString();
      bot.sendMessage(chatId, `Kết quả của ${expression} = ${result}`);
    } else {
      bot.sendMessage(
        chatId,
        `Sai biểu thức rồi cha nội ơi, ${expression}, nhập lại đi !`
      );
    }
  } catch (error) {
    bot.sendMessage(
      chatId,
      `❌ Biểu thức sai rồi cha nội ơi: ~${expression}~`,
      {
        parse_mode: "Markdown",
      }
    );
  }
});
//donate
bot.onText(/\/donate/, (msg) => {
  const chatId = msg.chat.id;

  const message =
    "Cảm ơn ae đã ủng hộ hehe \n" +
    "✔ Ethereum, BSC \n" +
    "0xC8d2c71cDaa4bf5a6DDa0cEF9de0fb3aB90Da8EB \n" +
    "✔ Solana\n" +
    "99S6JzFpoVH9ALSTSd12aNkHKhwaq7QduaMWfoFvrBrg\n";

  bot.sendMessage(chatId, message);
});
bot.onText();
console.log("Bot đã khởi động...");
