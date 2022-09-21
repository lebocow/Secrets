require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.mongoDBConn);

const userSchema = mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.route("/").get((req, res) => {
  res.render("home");
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        const newUser = new User({
          email: req.body.username,
          password: hash,
        });
        newUser.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.render("secrets");
          }
        });
      });
    });
  });

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
      if (err) {
        res.send(err);
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, (err, result) => {
            if (err) {
              res.send(err);
            } else {
              if (result) {
                res.render("secrets");
              } else {
                res.send("Incorrect password. Try again");
              }
            }
          });
        } else {
          res.send("No username found. Try again");
        }
      }
    });
  });

app.listen(PORT, function () {
  console.log("Server is running on port 3000");
});
