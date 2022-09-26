const router = require("express").Router();
const verifyBearerToken = require("./helper/verifyBearerToken");
const User = require("./models/User");
const Message = require("./models/Message");
const Post = require("./models/Post");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
dotenv.config();

const cronTime = "*/10 * * * * *";

const scheduled = cron.schedule(cronTime, async () => {
  const allFiles = [];
  const usedFiles = [];
  const cronDeletedFiles = [];

  const directoryPath = path.join(__dirname, "/public/assets");
  console.log("cron job running");
  const user = await User.find({
    profilePicture: { $ne: "", $exists: true },
  }).select(["profilePicture"]);
  user.map((usr) => {
    const googlePicture = usr.profilePicture.includes(
      "https://lh3.googleusercontent.com"
    );
    if (!googlePicture) {
      const profilePicture = usr.profilePicture.replace(
        "https://api-weav.fly.dev/images/",
        // "http://localhost:1000/images/",
        ""
      );
      usedFiles.push(profilePicture);
    }
  });
  const message = await Message.find({
    images: { $exists: true, $ne: [] },
  }).select(["images"]);
  message.map((msg) => {
    msg.images.map((img) => {
      usedFiles.push(img);
    });
  });
  const post = await Post.find({
    images: { $exists: true, $ne: [] },
  }).select(["images"]);
  post.map((pst) => {
    pst.images.map((img) => {
      usedFiles.push(img);
    });
  });
  fs.readdir(directoryPath, async function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    files.forEach(function (file) {
      allFiles.push(file);
    });

    allFiles.map((file) => {
      if (!usedFiles.includes(file)) {
        cronDeletedFiles.push(file);
      }
    });

    cronDeletedFiles.map((item) => {
      if (fs.existsSync(`./public/assets/${item}`)) {
        fs.unlink(`./public/assets/${item}`, (err) => {
          if (err) {
            console.log(err);
          }
        });
      } else {
        console.log(
          item + " => Cannot find file for deleted files on cron job"
        );
      }
    });

    if (cronDeletedFiles.length === 0) {
      console.log("No files to delete");
      scheduled.stop();
      setTimeout(() => {
        scheduled.start();
        console.log("start cron jobs again after 1 minutes");
      }, 60000);
      // cronTime = "*/40 * * * * *";
    } 
    console.log({
      allFiles: allFiles.length,
      usedFiles: usedFiles.length,
      cronDeletedFiles: cronDeletedFiles.length,
    });
  });
});

// scheduled.start();

module.exports = { scheduled };
