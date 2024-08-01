const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const nonUserRoutes = require("./routes/nonUserRoutes");
const searchRoutes = require("./routes/searchRoutes");
const commentRoutes = require("./routes/commentRoutes");
const moviedleRoutes = require("./routes/moviedleRoutes");
const bodyParser = require("body-parser");
const Redis = require("redis");
const redisClient = Redis.createClient();
redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}
connectRedis();

//using mongoose to connect application to mongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected"))
  .catch((err) => {
    console.log("Database not connected.");
    console.log(err);
  });

//middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});
const port = 8000;

app.listen(port, () => console.log(`Server is running on ${port}`)); //opens a port at 8000 and listens for requests.
app.use("/", authRoutes); //uses authRoutes to handle requests to the route in the "" so "/" would be for all requests, "/users" will append link/users/ whatever additional links there are in authRoutes.
app.use("/user", userRoutes);
app.use("/homepage", nonUserRoutes);
app.use("/searchMedia", searchRoutes);
app.use("/comments", commentRoutes);
app.use("/moviedle", moviedleRoutes);
