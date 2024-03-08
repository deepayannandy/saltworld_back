import { Router } from "express";
import User from "../models/userModel.js";
import { login_validation } from "../validators/validation.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
import { ObjectId } from "mongodb";
import verifyToken from "../validators/verifyToken.js";
import _ from "lodash";
import { registrationValidation } from "../validators/registrationValidation.js";
import { registrationUpdateValidator } from "../validators/registrationUpdateValidator.js";

const { compare, genSalt, hash } = bcryptjs;
const { sign } = jwt;

const router = Router();

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "appsdny@gmail.com",
    pass: process.env.MAILER_PASS,
  },
  port: 465,
  host: "smtp.gmail.com",
});

//login user
router.post("/login", async (req, res) => {
  //validate the data
  const valid = login_validation(req.body);
  if (valid.error) {
    return res.status(400).send({ message: valid.error.details[0].message });
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({ message: "User dose not exist!" });

  // validate password
  const validPass = await compare(req.body.password, user.password);
  if (!validPass)
    return res.status(400).send({ message: "Emailid or password is invalid!" });
  if (!user.UserStatus)
    return res.status(400).send({ message: "User is not an active user!" });

  //create and assign token
  const token = sign(
    { _id: user._id, UserType: user.UserType },
    process.env.SECREAT_TOKEN
  );
  res.header("auth-token", token).send(token);
});

//create user
router.post("/register", async (req, res) => {
  const ts = Date.now();
  const currentDate = new Date(ts);
  const date = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  //validate the data

  const { value, error } = registrationValidation(req.body);
  if (error) {
    return res.status(422).json({ message: error.message });
  }
  const email_exist = await User.findOne({ email: value.email });
  if (email_exist) {
    return res.status(400).json({ message: "Email already exist!" });
  }

  //hash the password
  const salt = await genSalt(10);
  const hashedPassword = await hash(value.password, salt);

  const dateNow =
    year + "-" + ("0" + month).slice(-2) + "-" + ("0" + date).slice(-2);

  const user = new User({
    ..._.omit(value, "password"),
    userStatus: true,
    password: hashedPassword,
    status: "Pending",
    statusBg: "#FEC90F",
    onBoardingDate: dateNow,
  });

  try {
    const newUser = await user.save();
    const regestereduserMail = {
      from: "appsdny@gmail.com",
      to: req.body.email,
      subject: "Welcome to Salt World",
      text: `Hi ${req.body.FirstName},
    Congratulations on your successful registration at Salt World. User these Credentials to login to our system.

    Your login id: ${req.body.email}
    Password: ${req.body.password}

    * Do Not Share this mail *

    Thank you
    Team Salt World`,
    };
    transporter.sendMail(regestereduserMail, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(201).json({ _id: newUser.id });
  } catch (error) {
    console.log({ error });
    res.status(400).json({ message: error.message });
  }
});

//get a user
router.get("/:id", getUser, (req, res) => {
  res.send(res.user);
});
// get my data
router.get("/mydata/me", verifyToken, async (req, res) => {
  console.log(req.tokendata._id);
  const user = await User.User.findOne({ _id: req.tokendata._id });
  if (!user) return res.status(400).send({ message: "User dose not exist!" });
  res.send(user);
});

//get all user
router.get("/", verifyToken, async (_, res) => {
  const users = await User.find();
  if (!users) {
    return res.status(400).send({ message: "Users dose not exist!" });
  }
  try {
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get("/all", verifyToken, async (_, res) => {
//   try {
//       const users = await User.find();
//       console.log(users);
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

//update user
router.patch("/:id", verifyToken, getUser, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const { value, error } = registrationUpdateValidator(req.body);
  if (error) {
    return res.status(422).json({ message: error.message });
  }

  const salt = await genSalt(10);
  const hashedPassword = await hash(value.password, salt);

  try {
    const updatedUser = await User.updateOne(
      { _id: res.user._id },
      {
        ..._.omit(value, "password"),
        password: hashedPassword,
      }
    );
    res.status(201).json({ _id: updatedUser.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User unavailable!" });
  }

  try {
    const result = await User.deleteOne({ _id: new ObjectId(req.params.id) });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//middleware
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User unavailable!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.user = user;
  next();
}

export default router;
