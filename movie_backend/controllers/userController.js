const jwt = require("jsonwebtoken");
const ListSchema = require("../models/lists");
const returnUser = (req, res) => {
  // res.json({ userAuthentication: req.decoded.email });
};
const authenticateUser = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  try {
    if (typeof bearerHeader !== "undefined") {
      console.log("inside authenticateUser");
      const accessToken = bearerHeader.split(" ")[1];
      console.log(bearerHeader);
      const decoded = jwt.verify(accessToken, process.env.LOGIN_SECRET);
      console.log("AUTHENTICATION WORKED");
      console.log(decoded);
      req.decoded = decoded;
      next();
    } else {
      res.status(404).json({ error: "no access token provided" });
    }
  } catch (err) {
    console.log(err);
    console.log("THIS IS THE FAILED AUTHENTICATION ERROR");
    //console.log(err);
    res.status(403).json({ error: "Expired Token" });
  }
};
const getLists = async (req, res) => {
  // console.log("inside getting list");
  const user = req.body.user;
  try {
    const listData = await ListSchema.find({ email: user });
    // console.log("List Data" + listData);
    console.log(req.decoded);
    res.json({ listData: listData, userAuthentication: req.decoded.email });
  } catch (error) {
    console.log("no lists found");
    console.log(error);
    res.status(500).json(error);
  }
};
const addList = async (req, res) => {
  const user = req.body.user;
  try {
    console.log();
    const created = await ListSchema.create({
      email: user,
      title: req.body.title,
      mediaType: req.body.media,
    });
    res.json({ created: created, userAuthentication: req.decoded.email });
  } catch (error) {
    console.log("Error Creating List, possibly title already exists");
    console.log(error);
    res.status(500).json(error);
  }
};
const updateList = async (req, res) => {
  const user = req.body.user;
  console.log(user);
  console.log(req.body.title);
  console.log(req.body.mediaItem);
  try {
    if (req.body.action === "add") {
      const result = await ListSchema.updateOne(
        { email: user, title: req.body.title },
        { $push: { media: req.body.mediaItem } }
      );
      console.log(result);
      if (result.modifiedCount > 0) {
        res.json({ result: "success", userAuthentication: req.decoded.email });
      } else {
        res.json({ result: "no error, but nothing modified either" });
      }
    } else if (req.body.action === "remove") {
      const result = await ListSchema.updateOne(
        { email: user, title: req.body.title },
        { $pull: { media: { id: req.body.mediaItem.id } } }
      );
      console.log("Removed Movie From List");
      console.log(result.modifiedCount);
      if (result.modifiedCount > 0) {
        res.json({
          result: "success",
          userAuthentication: req.decoded.email,
        });
      } else {
        res.json({ result: "no error, but nothing modified either" });
      }
    } else {
      res.staus(400).json("Invalid action specified");
    }
  } catch (error) {
    console.error("Error updating list:", error);
    res.status(500).send("Failed to update list");
  }
};
const deleteList = async (req, res) => {
  console.log("Inside Delete List");
  console.log(req.body.title);
  try {
    const response = await ListSchema.deleteOne({
      email: req.body.user,
      title: req.body.title,
    });
    console.log(response.deletedCount);
    res.json("Success");
  } catch (error) {
    console.log("Error", error);
    res.status(500).json("Failed to deleted list");
  }
};
module.exports = {
  authenticateUser,
  addList,
  updateList,
  deleteList,
  getLists,
  returnUser,
};
