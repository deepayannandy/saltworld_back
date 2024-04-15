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
    user: "appsdny@gmail.com",
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
  const client = new Client(value);

  try {
    const newClientData = await client.save();

    const mail = {
      from: "appsdny@gmail.com",
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

    transporter.sendMail(mail, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
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
    return res.status(422).json({ message: error.message });
  }

  if (value.mobileNumber) {
    value.mobileNumber = Number(value.mobileNumber);
  }

  try {
    const updatedClient = await Client.updateOne({ _id: client.id }, value);
    res.status(201).json({ _id: updatedClient.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get a clients
router.get("/:id", async (req, res) => {
  let client = await Client.findById(req.params.id);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  const clientMembershipData = [];
  for (const clientMembership of client.clientMemberships) {
    let data = clientMembership.toObject();
    let membership = await Membership.findById(clientMembership.membershipId);
    const services = [];
    for (const serviceId of membership.serviceIds) {
      const service = await Service.findById(serviceId);
      services.push(service.toObject());
    }
    membership = membership.toObject();
    membership["services"] = services;

    data = Object.assign({}, data, { membership });
    clientMembershipData.push(data);
  }

  client = client.toObject();
  client.clientMemberships = clientMembershipData;
  return res.status(200).json(client);
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
    const nameRegex = new RegExp(req.params.para, "i");
    const clients = await Client.find().or([
      { firstName: nameRegex },
      { lastName: nameRegex },
    ]);

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all clients
router.get("/", async (_, res) => {
  try {
    const clients = await Client.find().limit(10);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
