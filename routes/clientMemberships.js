import { Router } from "express";
import verifyToken from "../validators/verifyToken.js";
import Membership from "../models/membershipsModel.js";
import Services from "../models/servicesModel.js";
import { clientMembershipCreateValidator } from "../validators/clientMembershipCreateValidator.js";
import Client from "../models/clientModel.js";
import _ from 'lodash';

const router = Router();

//add services
router.post("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }
  req.body.active = true;
  const value  = await Membership.findById(req.body.membershipId);
  console.log(value)
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const test= "Deepayan";
  let client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }
  try {
    client.clientMemberships.push(
    {name:value.name,
    services: value.services,
    description: value.description,
    sellingCost: value.sellingCost,
    taxRate: value.taxRate,
    hsnCode: value.hsnCode,
    active: value.active,
    branch:value.branch,
    isUnlimited: value.isUnlimited,
    validity: value.validity,
    startDate,
    endDate}
  );
    console.log(client);
    console.log("I am called");
    client = await client.save();
    console.log(client);
    res.status(201).json(client._id);
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message });
  }
});

router.get("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  try {
    res.status(200).json(client.clientMemberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.body.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  if (!client.clientMemberships?.length) {
    return res.status(404).json({ message: "Client memberships not found" });
  }

  const clientMembership = client.clientMemberships.find(
    (clientMembership) => clientMembership._id === req.params.id
  );
  if (!clientMembership) {
    return res.status(404).json({ message: "Client membership not found" });
  }

  const membership = await Membership.findById(clientMembership.membershipId);

  client.clientMemberships = client.clientMemberships.filter(
    (clientMembership) => clientMembership.id !== req.params.id
  );

  try {
    await client.save();
    return res.status(200).json({
      message: `${membership.name} ${membership.hsnCode} membership is deleted.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
