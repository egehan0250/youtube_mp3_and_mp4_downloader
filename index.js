const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const ejs = require("ejs");
const contentDisposition = require("content-disposition");
const ytdl = require("ytdl-core");
const moment = require("moment");
moment.locale("tr");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "./web"));
app.use(express.static("web"));

app.use(
  express.static(path.join(__dirname, "/"), {
    dotfiles: "allow",
  })
);

app.use("/assets", express.static(path.join(__dirname, "./assets/*")));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/download", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const { type, url, quality } = req.body;
    if (!type || !url || !quality) {
     return res.status(400).json({
        status: 400,
        message: "Bad Request",
      });
    }
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request",
      });
    }
    const info = await ytdl.getInfo(url);
    let { title } = info.videoDetails;
    title = title.replace(/[^\w\s]/gi, "");
    
    if (type == "mp3") {
      const stream = ytdl(url, {
        quality: quality == 1 ? "highestaudio" : "lowestaudio",
        filter: "audioonly",
      });
   //Title ı kısalat ve sonuna kalite ve site adını ekle
      res.setHeader(
        "Content-Disposition",
        contentDisposition(`${title.slice(0, 15)}-${quality == 1 ? 'Yüksek_Kalite' : 'Düşük_Kalite'}-Youtube.mp3`)
      );
  
      stream.pipe(res);
    } else if (type == "mp4") {
      const stream = ytdl(url, {
        quality: quality == 1 ? "highest" : "lowest",
        filter: "videoandaudio",
      });
      res.setHeader(
        "Content-Disposition",
        contentDisposition(`${title.slice(0, 15)}-${quality == 1 ? 'Yüksek_Kalite' : 'Düşük_Kalite'}-Youtube.mp4`)
      );
      stream.pipe(res);
    } else {
      res.status(400).json({
        status: 400,
        message: "Bad Request",
      });
    }
    

    console.log(chalk.green(`[SERVER]`) + chalk.gray(` [${moment().format("HH:mm:ss")}]`) + chalk.yellow(` ${ip} ip adresli bir kişi yükleme yapıyor;`) + chalk.green(` Format: [.${type}], Kalite: [${quality == 1 ? 'Yüksek' : 'Düşük'}] |  ${url}`));

  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(
    chalk.green(`[SERVER]`) + chalk.yellow(` Server started on port ${port}`)
  );
});
