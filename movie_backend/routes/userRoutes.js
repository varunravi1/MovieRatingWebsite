const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const {
  authenticateUser,
  getLists,
  addList,
  updateList,
  deleteList,
  returnUser,
} = require("../controllers/userController");
const { scraper } = require("../controllers/tmdbController");
const cors = require("cors");
const router = express.Router();

router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://4r8z3n3m-5173.use.devtunnels.ms",
    ],
  })
);

// router.use(
//   cors({
//     //cors basiaclly authorizes the requests sent from localhost:5173
//     credentials: true,
//     origin: "http://localhost:5173",
//   })
// );

router.use(authenticateUser);
router.get("/", (req, res) => {
  if (req.decoded) {
    res.json({ userAuthentication: req.decoded.email });
  } else {
    res.json("Token Is Wrong");
  }
});
router.get("/time_left", (req, res) => {
  try {
    if (typeof bearerHeader !== "undefined") {
      const accessToken = bearerHeader.split(" ")[1];
      const decoded = jwt.decode(accessToken, process.env.LOGIN_SECRET);
      console.log("Checking time left in token");
      console.log(decoded);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
      const remainingTime = decoded.exp - currentTime; // Remaining time in seconds
      res.json(remainingTime);
    } else {
      res.status(404).json({ error: "no access token provided" });
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/list", getLists);
router.post("/list/add", addList);
router.patch("/list:listID", updateList);
router.delete("/list:listID", deleteList);

// router.post("/scores", scraper);
// router.get("/homepage", (req, res) => {});

module.exports = router;
