const {
  registerUser,
  loginUser,
  verifyRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  checkEmail,
} = require("../controllers/authController");
const { requestScroller } = require("../controllers/tmdbController");
const express = require("express");
const cors = require("cors");
const UserRouter = require("./userRoutes");

router = express.Router();

//middleware
router.use(
  cors({
    //cors basiaclly authorizes the requests sent from localhost:5173
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/register", registerUser); //runs registerUser from authController when asking to create an account.
router.post("/check_email", checkEmail);
router.post("/login", loginUser); //runs loginUser from authController when asking to login
router.get("/refresh_token", verifyRefreshToken);
// router.put("/refresh_token", updateRefreshToken);
router.delete("/refresh_token", deleteRefreshToken);
router.get("/scroller", requestScroller);

module.exports = router;
