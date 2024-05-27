const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: true,
  },
  refreshToken: {
    type: String,
    required: false,
  },
});
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
