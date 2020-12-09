const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer = require("multer");

const connectionString =
  "mongodb+srv://ugurcimenoglu:Ugur1621@cluster0.2ywuf.mongodb.net/eticaretmongoose?retryWrites=true&w=majority";

var store = new MongoDBStore({
  uri: connectionString,
  collection: "mySessions",
});

app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 3600000, // Oturumu sonlandırma süresi 3.600.000 saniye yani 1 saat sonra cookie silinir.
    },
    store: store,
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/img");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname) // imageURL-116150312.jpeg 
    );
  },
});

//bodyparser dahil ediyoruz
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:storage}).single("imageURL"));

//public klasörü
app.use(express.static(path.join(__dirname, "public")));

//pug ekleme
app.set("view engine", "pug");
app.set("views", "./views");

//Add Routing
const adminRoutes = require("./routes/adminRouting");
const shopRoutes = require("./routes/shopRouting");
const accountRoutes = require("./routes/accountRouting");

//add Errors Controller
const errors = require("./controllers/errors");

//User Model
const User = require("./models/user");
const { memoryStorage } = require("multer");

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(csrf());

app.use("/account", accountRoutes);
app.use("/admin", adminRoutes);
app.use("/", shopRoutes);
app.use("/500", errors.get500Page);
app.use(errors.get404Page);
app.use((error, req, res, next) => {
  res.status(500).render("errors/500", { title: "Hata Oluştu." });
});

mongoose
  .connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })

  .then(() => {
    console.log("Bağlantı başarılı.");
    app.listen(3000, () => {
      console.log("Server 3000 Portunda Yayında.");
    });
  })

  .catch((err) => {
    console.log(err);
  });
