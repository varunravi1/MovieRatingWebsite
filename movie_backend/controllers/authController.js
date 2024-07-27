const UserSchema = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const hashFunc = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });
};
const comparePass = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};
const issueRefreshToken = (data) => {
  return jwt.sign({ email: data }, process.env.LOGIN_REFRESH_SECRET, {
    expiresIn: "90d",
  });
};
const issueAccessToken = (data) => {
  return jwt.sign({ email: data }, process.env.LOGIN_SECRET, {
    expiresIn: "2h",
  });
};
//REGISTERING USER
const registerUser = async (req, res) => {
  try {
    const { username, email, age, password } = req.body;
    const emailExists = await UserSchema.findOne({ email });
    if (!email || emailExists) {
      return res.json({
        err: "unique email is required",
      });
    }
    if (!password || password.length < 8) {
      return res.json({
        err: "password is required and should be atleast 8 characters long",
      });
    }
    const accessToken = issueAccessToken(email);
    const refreshToken = issueRefreshToken(email);
    const pass = await hashFunc(password);
    const user = await UserSchema.create({
      username,
      email,
      age,
      password: pass,
      refreshToken: refreshToken,
    });
    console.log("Response from creating the user");
    console.log(user.id);
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/refresh_token",
        secure: true,
        sameSite: "Strict",
      })
      .json({ accessToken: accessToken, id: user.id });
  } catch (error) {
    console.log(error);
  }
};

//LOGIN USER
const loginUser = async (req, res) => {
  const bearerHeader = req.headers["authorization"];
  // const refresh_token = req.cookies.refreshToken;
  // console.log("refresh tk");
  // console.log(refresh_token);
  try {
    const { login, password } = req.body; //EXTRACTS EMAIL AND PASSWORD FROM JSON PAYLOAD
    // console.log(email);
    // console.log(password);
    const isValidEmail = await UserSchema.findOne(
      { email: login }
      //LOOKS IN THE DATABASE FOR A DATA ENTRY WITH EMAIL - INPUT FROM LOGIN.
    );
    console.log(isValidEmail);
    if (!isValidEmail) {
      console.log("email does not exist");
      console.log(isValidEmail);
      return res
        .status(404)
        .json({ err: "User does not have an account with this email" });
    } else {
      console.log("IT IS A VALID EMAIL YAYYYYYY");
      //FUNCTION AFTER THE FIND FUNCTION RETURNS
      // console.log(isValidEmail);
      const isMatch = await comparePass(password, isValidEmail.password); //COMPARES PASSWORD TO HASHED PASSWORD TO MAKE SURE IT IS THE CORRECT PASSWORD
      console.log(isMatch);
      if (isMatch) {
        const refreshToken = issueRefreshToken(login);
        console.log("This is the newly issued refresh token ", refreshToken);
        const accessToken = issueAccessToken(login);
        console.log("This is the access token ", accessToken);
        console.log("EMAIL AND PASSWORD MATCH!!!!!!!!!!");
        const result = await UserSchema.updateOne(
          //UPDATING THE REFRESH TOKEN IN THE DATABASE
          { email: login },
          { $set: { refreshToken: refreshToken } }
        );
        res
          .cookie("refreshToken", refreshToken, {
            //PUTTING IT IN THE COOKIE SO IT IS SECURE
            httpOnly: true,
            path: "/refresh_token",
            secure: true,
            sameSite: "Strict",
          })
          .json({ accessToken: accessToken, login: login });
      } else {
        return res.status(401).json({ err: "Passwords do not match" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyRefreshToken = async (req, res) => {
  const refresh_token = req.cookies.refreshToken;
  console.log(refresh_token);
  console.log("Checking if refresh token is in db");
  try {
    const user = await UserSchema.find({ refreshToken: refresh_token });
    console.log("found refresh token");
    console.log(user);
    // console.log(user[0].email);
    if (user.length !== 0) {
      const newToken = issueAccessToken(user[0].email);
      res.json({ accessToken: newToken, user: user });
    } else {
      console.log("No user is logged in.");
      res.status(500).json({ err: "Wrong Credentials" });
    }
  } catch (error) {
    res.status(501).json({ err: "no user is logged in" });
    console.log(error);
  }
};

const updateRefreshToken = async (req, res) => {};

const deleteRefreshToken = async (req, res) => {
  // Assuming refreshToken is stored in an HttpOnly cookie
  const token = req.cookies.refreshToken;
  try {
    res.clearCookie("refreshToken", {
      path: "/refresh_token",
      httpOnly: true,
      secure: true, // Use secure: true if using HTTPS
      sameSite: "Strict",
    });

    await UserSchema.updateOne(
      { refreshToken: token },
      { $set: { refreshToken: "" } }
    );
    console.log("logged out successfully");
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    res.status(5000).json({ message: "error during logout" });
  }
};

const checkEmail = async (req, res) => {
  console.log("inside check_email");
  console.log(req.body);
  const { username, email } = req.body;
  await UserSchema.findOne({ $or: [{ email: email }, { username: username }] })
    .then((response) => {
      console.log(response);
      if (response) {
        res.status(401).json({ error: "Username/Email Already exists" });
      } else {
        res.json({ msg: "green light to go ahead and register" });
      }
    })
    .catch((error) => {
      res.json({ msg: "green light to go ahead and register" });
    });
};

module.exports = {
  registerUser,
  loginUser,
  verifyRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  checkEmail,
};
