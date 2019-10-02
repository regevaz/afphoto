//server.js
const path = require("path");
const cloudinary = require("cloudinary");
const redis = require("redis");
const formData = require("express-form-data");
const cors = require("cors");
const { promisify } = require("util");
const unirest = require("unirest");

const { CLIENT_ORIGIN } = require("./config");

const express = require("express");
const favicon = require("express-favicon");
const HttpStatus = require("http-status-codes");

function start() {
  const port = process.env.PORT || 8080;
  const app = express();

  console.log(process.env.CLOUDINARY_URL);
  console.log(process.env.REDISCLOUD_URL);

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

  const secret = 'f23bdaa0-cf46-11e9-958b-abae05127859';
  app.get("/general", (req, res) => {
    console.log('get general quote');
    console.log(req.headers);
    const proxySecret = req.headers['x-rapidapi-proxy-secret'];
    if (!proxySecret || proxySecret !== secret) {
      res.sendStatus(HttpStatus.FORBIDDEN);
    } else {
      res.send({
        quote: 'Out of your vulnerabilities will come your strength.'
      });
    }
  });

  app.get("/today", (req, res) => {
    console.log('get date fact');
    console.log(req.headers);
    var ureq = unirest("GET", "https://numbersapi.p.rapidapi.com/6/21/date");
    ureq.query({
      "fragment": "true",
      "json": "true"
    });

    ureq.headers({
      "x-rapidapi-host": "numbersapi.p.rapidapi.com",
      "x-rapidapi-key": "1c2e1e399cmshe233c3e9ad3b801p1bacd5jsn175a3b978ba9"
    });

    ureq.end(function (response) {
      if (response.error) throw new Error(response.error);
      console.log(response.body);
      res.send(response.body);
    });
  });

  app.get("/:appId", (req, res) => {
    console.log(req.params);
    const appId = req.params.appId;
    getAsync(appId)
      .then(function(result) {
        console.log(result);
        const config = JSON.parse(result);
        if (!config) {
          res.sendStatus(HttpStatus.BAD_REQUEST);
        } else {
          res.send({
            title: config.title,
            subTitle: config.subTitle
          });
        }
      })
      .catch(e => {
        res.sendStatus(HttpStatus.BAD_REQUEST);
      });
  });

  app.get("/list/:appId", async (req, res) => {
    console.log(req.params);
    const appId = req.params.appId;
    const configStr = await getAsync(appId);
    const config = JSON.parse(configStr);
    if (!config) {
      res.sendStatus(HttpStatus.BAD_REQUEST);
    } else {
      console.log(config.key);
      try {
        const result = await resources_by_tag(config.key);
        console.log(result.resources);
        res.send(result.resources.map(i => i.secure_url));
      } catch (e) {
        console.log(e);
        res.send(500);
      }
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
}

module.exports.start = start;
