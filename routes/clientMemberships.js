const express = require("express");
const router = express.Router();
const clientMembershipsModel = require("../models/clientMembershipModel");
const verifie_token = require("../validators/verifyToken");
const _ = require("lodash");

//add services
router.post("/", verifie_token, async (req, res) => {
  if (req.tokendata.UserType != "Admin")
    return res.status(500).json({ message: "Access Pohibited!" });
  var StartDate = new Date(req.body.StartDate);
  var EndDate = new Date(
    StartDate + req.body.validDuration * 24 * 60 * 60 * 1000
  );
  const clientmembeship = new clientMembershipsModel({
    clientid: req.body.clientid,
    MembershipName: req.body.MembershipName,
    Services: req.body.Services,
    paidAmount: req.body.paidAmount,
    Taxrate: req.body.Taxrate,
    HsnCode: req.body.HsnCode,
    active: true,
    count: req.body.count,
    countleft: req.body.count,
    StartDate: StartDate,
    EndDate: EndDate,
  });
  try {
    const newclientmembeship = await clientmembeship.save();
    res.status(201).json(newclientmembeship._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:clientid", verifie_token, async (req, res) => {
  if (req.tokendata.UserType != "Admin")
    return res.status(500).json({ message: "Access Pohibited!" });
  try {
    const clientMemberships = await clientMembershipsModel.find({
      clientid: req.params.clientid,
    });

    const clientMembershipData = [];
    for (const clientMembership of clientMemberships) {
      let data = _.omit(clientMembership.toObject(), "Services");
      for (const service of clientMembership.Services) {
        data = Object.assign({}, data, service);
        clientMembershipData.push(data);
      }
    }

    res.json(clientMembershipData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const clientMembership = await clientMembershipsModel.findById(req.params.id);
  if (!clientMembership) {
    return res.status(404).json({ message: "Membership not found" });
  }

  try {
    const deleteResult = await clientMembershipsModel.deleteOne({
      _id: new mongodb.ObjectId(req.params.id),
    });

    if (deleteResult.acknowledged) {
      return res
        .status(200)
        .json({
          message: `${clientMembership.MembershipName} ${clientMembership.HsnCode} is deleted.`,
        });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
