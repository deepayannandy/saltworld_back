import { Router } from "express";
import Service from "../models/servicesModel.js";
import verifyToken from "../validators/verifyToken.js";
import { serviceCreateValidator } from "../validators/serviceCreateValidator.js";
import { serviceUpdateValidator } from "../validators/serviceUpdateValidator.js";

const router = Router();

//add services
router.post("/", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  req.body.active = true;
  const { value } = serviceCreateValidator(req.body);
  if (value.sellingCost && value.taxRate) {
    value.includeTax =
      value.sellingCost + (value.sellingCost * value.taxRate) / 100;
  }
  
  const existingService = await Service.findOne({ name: value.name });
  if (existingService) {
    return res.status(400).json({ message: "Service name already exists!" });
  }

  const service = new Service(value);
  try {
    const newService = await service.save();
    res.status(201).json(newService._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//get a service
router.get("/:id", verifyToken, getServices, (_, res) => {
  res.send(res.service);
});

router.patch("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: "Service not found!" });
  }

  const { value } = serviceUpdateValidator(req.body);
  if (value.sellingCost && value.taxRate) {
    value.includeTax =
      value.sellingCost + (value.sellingCost * value.taxRate) / 100;
  }

  try {
    const updatedService = await Service.updateOne({ _id: service.id }, value);
    res.status(201).json(updatedService._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//get all services
router.get("/", verifyToken, async (_, res) => {
  try {
    const services = await Service.find({active: true});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: "Service not found!" });
  }

  try {
    const deletedService = await Service.updateOne(
      { _id: service.id },
      { active: false }
    );
    res.json(deletedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//middleware
async function getServices(req, res, next) {
  let service;
  try {
    service = await Service.findOne
    ({ _id: req.params.id, active: true });
    if (!service) {
      return res.status(404).json({ message: "Service not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.service = service;
  next();
}

export default router;
