const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
  },
  mediaID: {
    type: String,
  },
});
const CommentModel = mongoose.model("Comments", commentSchema);
module.exports = CommentModel;
