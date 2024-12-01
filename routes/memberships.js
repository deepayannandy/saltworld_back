import { Router } from "express";
import Membership from "../models/membershipsModel.js";
import { membershipCreateValidator } from "../validators/membershipCreateValidator.js";
import { membershipUpdateValidator } from "../validators/membershipUpdateValidator.js";
import verifyToken from "../validators/verifyToken.js";
import Services from "../models/servicesModel.js";

const router = Router();

//add services
router.post("/", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }
  req.body.active = true;
  const { value } = membershipCreateValidator(req.body);

  const membership = new Membership(value);
  try {
    const newMembership = await membership.save();
    res.status(201).json(newMembership._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//get a service
router.get("/:id", getMemberships, (_, res) => {
  res.send(res.membership);
});

//get all services
router.get("/", async (_, res) => {
  try {
    const allMemberships = await Membership.find({active: true});
    res.json(allMemberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const membership = await Membership.findById(req.params.id);
  if (!membership) {
    return res.status(404).json({ message: "Membership Data not found!" });
  }

  try {
    const deletedMembership = await Membership.updateOne(
      { _id: membership.id },
      {active: false},
    );
    res.json(deletedMembership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const membership = await Membership.findById(req.params.id);
  if (!membership) {
    return res.status(404).json({ message: "Membership Data not found!" });
  }

  const { value } = membershipUpdateValidator(req.body);

  try {
    const updatedMembership = await Membership.updateOne({ _id: membership.id }, value);
    res.status(201).json({ _id: updatedMembership.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//middleware
async function getMemberships(req, res, next) {
  let membership;
  try {
    membership = await Membership.findOne({ _id: req.params.id, active: true });
    if (!membership) {
      return res.status(404).json({ message: "Membership not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.membership = membership;
  next();
}

export default router;
