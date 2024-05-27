const jwt = require("jsonwebtoken");
const authenticateUser = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  try {
    if (typeof bearerHeader !== "undefined") {
      const accessToken = bearerHeader.split(" ")[1];
      const decoded = jwt.verify(accessToken, process.env.LOGIN_SECRET);
      console.log("AUTHENTICATION WORKED");
      console.log(decoded);
      req.decoded = decoded;
      next();
    } else {
      res.status(403).json({ error: "no access token provided" });
    }
  } catch (err) {
    console.log("THIS IS THE FAILED AUTHENTICATION ERROR");
    //console.log(err);
    res.status(403).json({ error: "Expired Token" });
  }
};

module.exports = { authenticateUser };
