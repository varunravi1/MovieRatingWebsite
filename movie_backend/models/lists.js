const mongoose = require("mongoose");
const { Schema } = mongoose;
const listSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
  },
  media: {
    type: [mongoose.Schema.Types.Mixed],
  },
});
listSchema.index({ email: 1, title: 1 }, { unique: true });
const ListModel = mongoose.model("list", listSchema);
module.exports = ListModel;
