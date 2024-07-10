const axios = require("axios");
const CommentSchema = require("../models/comments");
const UserSchema = require("../models/user");

const addComment = async (req, res) => {
  const email = req.body.user;
  const username = await UserSchema.findOne({
    email: email,
  });
  const usernameagain = username.username;

  //   console.log(usernameagain);
  const comment = req.body.comment;
  const mediaType = req.body.mediaType;
  const mediaID = req.body.mediaID;
  const time = getCurrentUTCDateTimeString();
  //   console.log(mediaType);
  //   console.log(mediaID);
  try {
    const response = CommentSchema.create({
      username: usernameagain,
      email: email,
      comment: comment,
      time: time,
      mediaType: mediaType,
      mediaID: mediaID,
    });
    res.json(usernameagain);
  } catch (error) {
    res.status(501).json("Failed to Add Comment");
    console.log(error);
  }
};

const getComments = async (req, res) => {
  const id = req.params.id;
  const mediaType = req.params.mediaType;
  console.log(id);
  console.log(mediaType);
  try {
    const response = await CommentSchema.find({
      mediaType: mediaType,
      mediaID: id,
    });
    res.json(response);
    //   console.log(response);
  } catch (error) {
    res.status(501).json("Failed to get Comments");
    console.log(error);
  }
};

const getCurrentUTCDateTimeString = () => {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = now.getUTCDate().toString().padStart(2, "0");

  const hours = now.getUTCHours().toString().padStart(2, "0");
  const minutes = now.getUTCMinutes().toString().padStart(2, "0");
  const seconds = now.getUTCSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
};

module.exports = {
  addComment,
  getComments,
};
