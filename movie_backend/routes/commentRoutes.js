const express = require("express");
const cors = require("cors");
const { addComment, getComments } = require("../controllers/commentController");
router = express.Router();

//middleware
router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/add_comment", addComment);
router.get("/:mediaType/:id", getComments);

module.exports = router;
