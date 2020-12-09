const User = require("../models/user");
const Login = require("../models/login");
const bcrypt = require("bcrypt");
const { Session } = require("express-session");
const session = require("express-session");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.getLogin = (req, res, next) => {
  let errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/login", {
    path: "/account/login",
    title: "Login",
    errorMessage: errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loginModel = new Login({
    email: email,
    password: password,
  });

  loginModel
    .validate()
    .then(() => {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.session.errorMessage =
              "Böyle bir E-mail Adresi Kayıtlı Değildir.";
            req.session.save((err) => {
              console.log(err);
              return res.redirect("/account/login");
            });
          } else {
            bcrypt.compare(password, user.password).then((result) => {
              if (result) {
                //bcrypt.compare bize true ya da false döner.
                req.session.user = user;
                req.session.isAuthenticated = true;
                console.log(req.session);
                return req.session.save(function (err) {
                  //Sessionun kaydedildiğinden emin oluoyruz.
                  let url = req.session.redirectTo || "/";
                  delete req.session.redirectTo;
                  return res.redirect(url);
                });
              } else {
                req.session.errorMessage =
                  "Hatalı e-posta veya şifre girdiniz!";
                req.session.save((err) => {
                  console.log(err);
                  return res.redirect("/account/login");
                });
              }
            });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      if (err.name == "ValidationError") {
        let message = "";
        for (field in err.errors) {
          message += err.errors[field].message + "<br>";
        }
        res.render("account/login", {
          path: "/login",
          title: "Login",
          errorMessage: message,
        });
      } else {
        next(err);
      }
    });
};

exports.getRegister = (req, res, next) => {
  let errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/register", {
    path: "/account/register",
    title: "Register",
    errorMessage: errorMessage,
  });
};

exports.postRegister = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (user) {
      req.session.errorMessage = "Bu E-mail Adresi Sistemimizde Kayıtlıdır!";
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        return res.redirect("/account/register");
      });
    } else {
      bcrypt
        .hash(password, 10)
        .then((passwordHash) => {
          const user = new User({
            name: name,
            email: email,
            password: passwordHash,
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/account/login");
          register(email);
        })
        .catch((err) => {
          if (err.name == "ValidationError") {
            let message = "";
            for (field in err.errors) {
              message += err.errors[field].message + "<br>";
            }
            res.render("account/register", {
              path: "/account/register",
              title: "Register",
              errorMessage: message,
            });
          }
        });
    }
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
  });
  res.redirect("/");
};

exports.getResetPass = (req, res) => {
  let errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("account/reset", {
    path: "/account/reset-password",
    title: "Reset Password",
    errorMessage: errorMessage,
  });
};

exports.postResetPass = (req, res) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/account/reset-password");
    } else {
      const token = buffer.toString("hex");
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.session.errorMessage =
              "Bu E-mail Adresi Sistemimizde Kayıtlı Değildir!";
            req.session.save((err) => {
              if (err) {
                console.log(err);
                return res.redirect("/account/reset-password");
              }
            });
          } else {
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
          }
        })
        .then(() => {
          resetPassword(email, token);
          res.redirect("/account/login");
        })
        .catch((err) => {
          next(err);
        });
    }
  });
};

module.exports.getNewPass = (req, res) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.redirect("/account/register");
    } else {
      res.render("account/newPassword", {
        path: "/account/newPassword",
        title: "New Password",
        userId: user._id,
        passwordToken: token,
      });
    }
  });
};

module.exports.postNewPass = (req, res) => {
  const token = req.body.passwordToken;
  const userId = req.body.userId;
  const newPassword = req.body.password;
  let _user;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        return res.redirect("/account/register");
      } else {
        _user = user;
        return bcrypt
          .hash(newPassword, 10)
          .then((hashedPassword) => {
            (_user.password = hashedPassword),
              (_user.resetToken = undefined),
              (_user.resetTokenExpiration = undefined);
            return _user.save();
          })
          .then(() => {
            res.redirect("/account/login");
          });
      }
    })
    .catch((err) => {next(err);});
};

async function register(email) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", //'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: "ugurcimenoglu@hotmail.com",
      pass: "Ugur3663",
    },
  });

  let info = await transporter.sendMail({
    from: `"Ugur Cimen" <ugurcimenoglu@hotmail.com>`,
    to: email,
    subject: "E-Ticaret Kayıt",
    text: "Kayıt Başarılı",
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

async function resetPassword(email, token) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", //'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: "ugurcimenoglu@hotmail.com",
      pass: "Ugur3663",
    },
  });

  let info = await transporter.sendMail({
    from: `"Ugur Cimen" <ugurcimenoglu@hotmail.com>`,
    to: email,
    subject: "Parola Sıfırlama",
    text: "Parolanızı Aşağıdaki linke tıklayarak yenileyebilirsiniz...",
    html: `
    <p>Yeni Parola Oluşturmak İçin Link : </p>
    <p>
      <a href="http://localhost:3000/account/reset-password/${token}"> Reset Password
    </p>
    `,
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
