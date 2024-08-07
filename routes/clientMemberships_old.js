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
  const { value } = clientMembershipCreateValidator(req.body);

  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  let client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }
  
  try {
    client.clientMemberships.push({ ...value, startDate, endDate });
    client = await client.save();
    const latestClientMembership = client.clientMemberships.find(
      (clientMembership) => clientMembership.membershipId === value.membershipId
    );

    res.status(201).json(latestClientMembership._id);
  } catch (error) {
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
    const clientMembershipData = [];
    for (const clientMembership of client.clientMemberships) {
      let data = clientMembership?.toObject();
      const membership = await Membership.findById(
        clientMembership.membershipId
      );
      data = Object.assign({}, data, membership?.toObject());
      console.log(data)
      for (const serviceId of membership.serviceIds) {
        const service = await Services.findById(serviceId);
        const serviceName = service?.name;
        data = Object.assign({}, data, {..._.omit(service?.toObject(), 'name'), serviceName});
        clientMembershipData.push(data);
      }
    }
    res.json(clientMembershipData);
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
