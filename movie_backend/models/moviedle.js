const mongoose = require("mongoose");
const { Schema } = mongoose;
const MovidleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  media: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const MoviedleModel = mongoose.model("Moviedle", MovidleSchema);
module.exports = MoviedleModel;
