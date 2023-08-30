const mongoose = require("mongoose");
const mongoDbConnection = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log(res.connection.name, res.connection.host, "db connected");
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = mongoDbConnection;
