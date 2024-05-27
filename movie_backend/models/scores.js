const mongoose = require("mongoose");

const { Schema } = mongoose;
const scoreSchema = new Schema({
  title: {
    type: String,
    unique: true,
  },
  date: {
    type: String,
    required: true,
  },
  criticScore: String,
  audienceScore: String,
});
const ScoreModel = mongoose.model("scores", scoreSchema);
module.exports = ScoreModel;
