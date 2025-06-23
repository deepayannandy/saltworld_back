import { Router } from "express";
import verifyToken from "../validators/verifyToken.js";
import Membership from "../models/membershipsModel.js";
import Services from "../models/servicesModel.js";
import { clientMembershipCreateValidator } from "../validators/clientMembershipCreateValidator.js";
import Client from "../models/clientModel.js";
import _ from "lodash";

const router = Router();

//add services
router.post("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }
  req.body.active = true;
  let value = await Membership.findById(req.body.membershipId);
  // console.log(value)
  var services = [];
  value.services.forEach((service) => {
    service.totalSessions = service.sessions;
    services.push(service);
  });
  console.log(">>>>>", services);
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  let client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }
  try {
    client.clientMemberships.push({
      name: value.name,
      services: services,
      description: value.description,
      sellingCost: value.sellingCost,
      taxRate: value.taxRate,
      hsnCode: value.hsnCode,
      active: value.active,
      branch: value.branch,
      isUnlimited: value.isUnlimited,
      validity: value.validity,
      startDate,
      endDate,
    });
    // console.log(client);
    // console.log("I am called");
    client = await client.save();
    // console.log(client);
    res.status(201).json(client._id);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

router.get("/:clientId&:isAll", verifyToken, async (req, res) => {
  try {
    console.log(req.params.clientId);
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: "Client Data not found!" });
    }
    if (req.params.isAll == "all")
      return res.status(200).json(client.clientMemberships);
    let activeList = [];
    activeList = client.clientMemberships.filter(
      (clientMembership) => new Date() < clientMembership.endDate
    );
    return res.status(200).json(activeList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.patch("/:clientId&:subsId", verifyToken, async (req, res) => {
  try {
    console.log(req.body.updatedServiceList);
    console.log("EndDate: ", req.body.enddate);
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: "Client Data not found!" });
    }
    client.clientMemberships.map((membership) => {
      if (membership._id == req.params.subsId) {
        if (
          new Date(req.body.enddate).getTime() > membership.endDate.getTime()
        ) {
          console.log("Let's Change to: ", new Date(req.body.enddate));
          membership.oldEndDate = membership.endDate;
          membership.endDate = new Date(req.body.enddate);
        }
        membership.services = req.body.updatedServiceList;
        return membership;
      }
      return membership;
    });
    await client.save();
    return res.status(200).json({ message: "Success!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id&:clientId", verifyToken, async (req, res) => {
  console.log(req.params.id, req.body.clientId);
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }
  const client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  if (!client.clientMemberships?.length) {
    return res.status(404).json({ message: "No Client memberships is found" });
  }

  const clientMembership = client.clientMemberships.find((clientMembership) =>
    clientMembership._id.equals(req.params.id)
  );
  if (!clientMembership) {
    return res.status(404).json({ message: "Client membership not found" });
  }

  client.clientMemberships = client.clientMemberships.filter(
    (clientMembership) => clientMembership.id !== req.params.id
  );

  try {
    await client.save();
    return res.status(200).json({
      message: `Membership deleted.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
