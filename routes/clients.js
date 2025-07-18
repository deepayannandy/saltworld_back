import { Router } from "express";
import verifyToken from "../validators/verifyToken.js";
import { createTransport } from "nodemailer";
import Client from "../models/clientModel.js";
import { clientCreateValidator } from "../validators/clientCreateValidator.js";
import { clientUpdateValidator } from "../validators/clientUpdateValidator.js";
import Membership from "../models/membershipsModel.js";
import Service from "../models/servicesModel.js";

const router = Router();

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "saltworld.acc@gmail.com",
    pass: process.env.MAILER_PASS,
  },
  port: 465,
  host: "smtp.gmail.com",
});

//create clients
router.post("/", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  req.body.emailNotification = true;
  req.body.emailMarketingNotification = true;
  const { value } = clientCreateValidator(req.body);
  const findClient = await Client.findOne({ mobileNumber: value.mobileNumber });
  if (findClient)
    return res.status(500).json({ message: "Client already exist!" });
  value.onBoardingDate = new Date(req.body.onBoardingDate);
  const client = new Client({ ...value });

  try {
    const newClientData = await client.save();

    const mail = {
      from: "saltworld.acc@gmail.com",
      to: value.email,
      subject: `👋 Welcome to Salt World Family ${value.firstName}`,
      text: `Hi ${value.firstName},
Welcome to SaltWorld Family. Thank you for choosing us! 

Know More about our services visit: https://saltworld.in/
Contact Details:  +91 76878 78793
Visit us at: https://g.co/kgs/DwpfsY

Thank you 
  Team Salt World`,
    };

    // transporter.sendMail(mail, (error, info) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });
    res.status(201).json(newClientData._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  const { value, error } = clientUpdateValidator(req.body);
  if (error) {
    console.log(error);
    return res.status(422).json({ message: error.message });
  }

  if (value.mobileNumber) {
    value.mobileNumber = Number(value.mobileNumber);
  }
  value.onBoardingDate = new Date(req.body.onBoardingDate);

  try {
    const updatedClient = await Client.updateOne({ _id: client.id }, value);
    res.status(201).json({ _id: updatedClient.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get a clients
router.get("/:id", async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client Data not found!" });
    }
    //todo fetch all appointment of the client
    return res.status(200).json(client);
  } catch (error) {
    return res.status(404).json({ message: "No data found" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  try {
    const deletedClient = await Client.deleteOne({ _id: client.id });
    res.json(deletedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search/:para", async (req, res) => {
  try {
    console.log(req.params.para.toString());
    if (req.params.para.length < 3) return res.json([]);
    const nameRegex = new RegExp(req.params.para, "i");
    // const lastNameRegex = new RegExp(req.params.para.split(" ")[1], "i");
    const clients = await Client.find({
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: [
                  { $trim: { input: "$firstName", chars: " " } },
                  " ",
                  { $trim: { input: "$lastName", chars: " " } },
                ],
              },
              regex: req.params.para, //Your text search here
              options: "i",
            },
          },
        },
        { mobileNumber: nameRegex },
        { email: nameRegex },
      ],
    }).limit(10);
    return res.json(clients);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
});

//get all clients
router.get("/", async (req, res) => {
  try {
    const size = parseInt(req.query.size);
    const page = parseInt(req.query.page);
    const clients = await Client.aggregate([
      {
        $facet: {
          clients: [
            {
              $sort: {
                onBoardingDate: -1,
              },
            },
            {
              $skip: (page - 1) * size,
            },
            {
              $limit: size,
            },
          ],
          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
      {
        $project: {
          clients: 1,
          numberOfItems: {
            $arrayElemAt: ["$totalCount.total", 0],
          },
          numberOfPages: {
            $ceil: {
              $divide: [
                {
                  $arrayElemAt: ["$totalCount.total", 0],
                },
                size,
              ],
            },
          },
        },
      },
    ]);
    res.json(clients[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
