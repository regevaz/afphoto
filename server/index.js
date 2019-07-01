//server.js
const { promisify } = require("util");
require("dotenv").config();
const cloudinary = require("cloudinary");
const redis = require("redis");
const formData = require("express-form-data");
const cors = require("cors");
const { CLIENT_ORIGIN } = require("./config");

const express = require("express");
const favicon = require("express-favicon");
const path = require("path");
const port = process.env.PORT || 8080;
const app = express();

console.log(process.env.CLOUD_NAME);
console.log(process.env.API_KEY);
console.log(process.env.REDISCLOUD_URL);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const client = redis.createClient(process.env.REDISCLOUD_URL, {
  no_ready_check: true
});
const getAsync = promisify(client.get).bind(client);
const authAsync = promisify(client.auth).bind(client);

const upload = promisify(cloudinary.v2.uploader.upload);
const resources = promisify(cloudinary.v2.api.resources);
const resources_by_tag = promisify(cloudinary.v2.api.resources_by_tag);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(formData.parse());

app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

authAsync("PhfZDDH19vLX3xwKPO0JkUxJpYtK1b2R").then(res => {
  console.log(`redis auth: ${res}`);
});

app.get("/:appId", (req, res) => {
  console.log(req.params);
  const appId = req.params.appId;
  getAsync(appId).then(function(result) {
    console.log(result);
    const config = JSON.parse(result);
    res.send({
      title: config.title,
      subTitle: config.subTitle
    });
  });
});

app.get("/list/:appId", async (req, res) => {
  console.log(req.params);
  const appId = req.params.appId;
  const configStr = await getAsync(appId);
  const config = JSON.parse(configStr);
  console.log(config.key);
  try {
    const result = await resources_by_tag(config.key);
    console.log(result.resources);
    res.send(result.resources.map(i => i.secure_url));
  } catch (e) {
    console.log(e);
    res.send(500);
  }
});

app.post("/image-upload/:appId", async (req, res) => {
  console.log(req.params);
  const appId = req.params.appId;
  console.log(`files: ${req.files}`);
  const configStr = await getAsync(appId);
  const config = JSON.parse(configStr);
  console.log(`got folder for app: ${config.key}`);
  const values = Object.values(req.files);

  const uploadedImages = [];
  for (let index = 0; index < values.length; index++) {
    const file = values[index];
    try {
      console.log(file.originalFilename);
      const parts = file.originalFilename.split(".");
      parts.pop();
      const fileName = parts.join("");
      const uploadRes = await upload(file.path, {
        public_id: `${config.key}/${fileName}`,
        tags: [config.key]
      });
      console.log(uploadRes);
      uploadedImages.push(uploadRes.secure_url);
    } catch (e) {
      console.log(e);
    }
  }
  res.json(uploadedImages);
});

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(port, () => console.log("👍"));
