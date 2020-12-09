const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;
//mongodb+srv://ugurcimenoglu:YFITiTQITbBa4swT@cluster0.6g0xf.mongodb.net/test
const mongoConnect = (callback) => {
  //MongoClient.connect('mongodb://localhost/e-ticaret')
  MongoClient.connect(
    "mongodb+srv://ugurcimenoglu:YFITiTQITbBa4swT@cluster0.6g0xf.mongodb.net/eticaret?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
    .then((client) => {
      console.log("Connected.");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No Database";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
