const { v4 } = require("uuid");

var fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const cors = require("cors");
const app = express();

// Set Middlewares
app.use(fileupload());
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

const port = process.env.PORT || 3000;
const IMAGE_PATH = "/public/images/";
const CONFIG_PATH = "public/config.json";
var galleryConfig = {};
var imageList = Array();

// Read Config File
fs.readFile(CONFIG_PATH, (err, data) => {
  galleryConfig = JSON.parse(data);
});

//Set public image path
app.use("/image", express.static(__dirname + "/public/images"));

// send config files
app.get("/", (req, res) => {
  imageList = [];
  fs.readdir("public/images", (err, files) => {
    files.forEach((file) => {
      imageList.push("/image/" + file);
    });
    galleryConfig.imageList = imageList;
    res.json(galleryConfig);
  });
});

// set config files
app.post("/", async (req, res) => {
  var textConfig = req.body;
  galleryConfig.text = textConfig.text;
  galleryConfig.title = textConfig.title;
  fs.writeFile(CONFIG_PATH, JSON.stringify(textConfig), (err) => {});
  res.json(galleryConfig);
});

// clear all image files
app.post("/clear", async (req, res) => {
  fs.readdir(__dirname + IMAGE_PATH, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(__dirname + IMAGE_PATH + file, (err) => {
        if (err) throw err;
      });
    }
    galleryConfig.imageList = [];
    res.json(galleryConfig);
  });
});

// upload image files
app.post("/upload", async (req, res) => {
  const files = req.files;

  for (const property in files) {
    var fileExt = files[property].name.split(".").pop();
    await files[property].mv(__dirname + IMAGE_PATH + v4() + "." + fileExt);
  }

  imageList = [];
  fs.readdir("public/images", (err, files) => {
    files.forEach((file) => {
      imageList.push("/image/" + file);
    });
    galleryConfig.imageList = imageList;
    res.json(galleryConfig);
  });
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
