import { Router } from "express";
import Membership from "../models/membershipsModel.js";
import { membershipCreateValidator } from "../validators/membershipCreateValidator.js";
import verifyToken from "../validators/verifyToken.js";

const router = Router();

//add services
router.post("/", verifyToken, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
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
router.get("/:id", getMemberships, (res) => {
  res.send(res.membership);
});

//get all services
router.get("/", async (res) => {
  try {
    const allMemberships = await Membership.find();
    res.json(allMemberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//middleware
async function getMemberships(req, res, next) {
  let membership;
  try {
    membership = await Membership.findById(req.params.id);
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
