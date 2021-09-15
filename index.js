const fs = require("fs");
const {
  WAConnection,
  MessageType,
  ReconnectMode,
} = require("@adiwajshing/baileys");
const ffmpeg = require("fluent-ffmpeg");
const streamifier = require("streamifier");
const Axios = require("axios");
const Crypto = require("crypto");
const { tmpdir } = require("os");
const path = require("path");
const imageminWebp = require("imagemin-webp");


async function connectToWhatsApp() {
  const conn = new WAConnection();
  conn.autoReconnect = ReconnectMode.onConnectionLost;
  conn.logger.level = "fatal";
  conn.connectOptions.maxRetries = 10;

  // this will be called as soon as the credentials are updated
  conn.on ('open', () => {
      // save credentials whenever updated
      console.log (`credentials updated!`)
      const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
      fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file
  })
  fs.existsSync("./auth_info.json") && conn.loadAuthInfo("./auth_info.json"); // load the auth info if it exists
  await conn.connect() // connect


  conn.on("chat-update", async (chatUpdate) => {
    if (chatUpdate.messages) {
      let m = chatUpdate.messages.all()[0];

      if (!m.message) return;
      handleCommand(m);
    }
  });

  async function handleCommand(m) {
    const messageType = Object.keys(m.message)[0];

    if (messageType == MessageType.image &&
    m.message.imageMessage.url &&
    ((m.message.imageMessage.caption == "!sticker") ||
    (m.message.imageMessage.caption == "!Sticker") ||
    (m.message.imageMessage.caption == "!s") ||
    (m.message.imageMessage.caption == "!S")))
    {
      let imageBuffer = await conn.downloadMediaMessage(m);
      let sticker = await imageminWebp({ preset: "icon" })(imageBuffer);
      await conn.sendMessage(m.key.remoteJid, sticker, MessageType.sticker);
      console.log("Sticker enviado a : " + m.key.remoteJid);
      //console.log("\n--------\n"+JSON.stringify(m)+"\n--------\n")
    }
    /* else if (messageType === MessageType.extendedText &&
      m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage &&// Imagen que fue citada
      ((m.message.extendedTextMessage.text == "!sticker") ||
      (m.message.extendedTextMessage.text == "!Sticker") ||
      (m.message.extendedTextMessage.text == "!s") ||
      (m.message.extendedTextMessage.text == "!S")))
    {
      const quotedMessage = m.message.extendedTextMessage.contextInfo.quotedMessage;
      let imageBuffer = await conn.downloadMediaMessage(quotedMessage.imageMessage);
      let sticker = await imageminWebp({ preset: "icon" })(imageBuffer);
      await conn.sendMessage(m.key.remoteJid, sticker, MessageType.sticker);
      console.log("Sticker enviado a : " + m.key.remoteJid);
    } */
    else if (messageType == MessageType.video &&
      m.message.videoMessage.url &&
      ((m.message.videoMessage.caption == "!sticker") ||
      (m.message.videoMessage.caption == "!Sticker") ||
      (m.message.videoMessage.caption == "!s") ||
      (m.message.videoMessage.caption == "!S")))
      {
      let processOptions = {
        fps: 16,
        startTime: `00:00:00.0`,
        endTime: `00:00:06.0`,
        loop: 0,
      };

      const tempFile = path.join(
        tmpdir(),
        `processing.${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
      );

      let videoBuffer = await conn.downloadMediaMessage(m);
      const videoStream = await streamifier.createReadStream(videoBuffer);
      let success = await new Promise((resolve, reject) => 
      {
        var command = ffmpeg(videoStream)
          .inputFormat("mp4")
          .on("error", function (err)
          {
            console.log("Ocurrió un error: " + err.message);
            reject(err);
          })
          .on("start", function (cmd)
          {
            console.log("Empezado" + cmd);
          })
          .addOutputOptions([
            `-vcodec`,
            `libwebp`,
            `-vf`,
            `crop=w='min(min(iw\,ih)\,512)':h='min(min(iw\,ih)\,512)',scale=150:150,setsar=1,fps=${processOptions.fps}`,
            `-loop`,
            `${processOptions.loop}`,
            `-ss`,
            processOptions.startTime,
            `-t`,
            processOptions.endTime,
            `-preset`,
            `default`,
            `-an`,
            `-vsync`,
            `0`,
            `-s`,
            `512:512`,
          ])
          .toFormat("webp")
          .on("end", () => {
            resolve(true);
          })
          .saveToFile(tempFile);
      });
      if (!success)
      {
        console.log("Error al procesar el video");
        return;
      }
      var bufferwebp = await fs.readFileSync(tempFile);
      await fs.unlinkSync(tempFile);
      await conn.sendMessage(m.key.remoteJid, bufferwebp, MessageType.sticker);
      console.log("Pegatina enviada a: " + m.key.remoteJid);
    }
  }

  conn.on("close", ({ reason, isReconnecting }) =>
    console.log(
      "Se ha perdido la conexión: " + reason + " Intentando reconectar: " + isReconnecting
    )
  );
}

connectToWhatsApp().catch((err) => console.log("Error inesperado: " + err));
