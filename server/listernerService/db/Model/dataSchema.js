const mongoose = require("mongoose")

const dataSchema = new mongoose.Schema({
  time_stamp: { type: Date, require: [true, "time_stamp data must be required"] },
  segments:{}
})

module.exports = mongoose.model("Messages", dataSchema)