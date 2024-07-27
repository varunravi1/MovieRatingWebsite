const {
  registerUser,
  loginUser,
  verifyRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  checkEmail,
} = require("../controllers/authController");
const { requestScroller } = require("../controllers/tmdbController");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const UserRouter = require("./userRoutes");

router = express.Router();

//middleware
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
router.get("/time_left", (req, res) => {
  const bearerHeader = req.headers["authorization"];
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
      console.log("no access token provided");
      res.status(404).json({ error: "no access token provided" });
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/register", registerUser); //runs registerUser from authController when asking to create an account.
router.post("/check_email", checkEmail);
router.post("/login", loginUser); //runs loginUser from authController when asking to login
router.get("/refresh_token", verifyRefreshToken);
// router.put("/refresh_token", updateRefreshToken);
router.delete("/refresh_token", deleteRefreshToken);
// router.get("/scroller", requestScroller);

module.exports = router;
