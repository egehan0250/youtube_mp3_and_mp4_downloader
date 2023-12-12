const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const path = require('path');
const chalk = require('chalk');
const ejs = require('ejs');
const ytdl = require('ytdl-core');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

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
        let { url, type } = req.body;
        console.log(type)
        if (!url) return res.send(`<center><h1>Lütfen Geçerli Bir YouTube linki giriniz.</h1></center>`);
        if (!ytdl.validateURL(url)) return res.send(`<center><h1>Geçersiz Youtube linki.</h1></center>`);

        let info = await ytdl.getInfo(url);
        let title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        if (type == "mp3") {
            res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
            ytdl(url, {
                format: "mp3",
                filter: "audioonly",
            }).pipe(res);
        } else if (type == "mp4") {
            res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
            ytdl(url, {
                format: "mp4",
            }).pipe(res);
        } else {
            res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
            ytdl(url, {
                format: "mp3",
                filter: "audioonly",
            }).pipe(res);
        }
    });

  app.listen(port, () => {
    console.log(chalk.green(`[SERVER]`) + chalk.yellow(` Server started on port ${port}`));
  });
