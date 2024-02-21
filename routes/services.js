import { Router } from "express";
import {
  findById,
  Service,
} from "../models/servicesModel";
import verifyToken from "../validators/verifyToken";
import { serviceCreateValidator } from "../validators/serviceCreateValidator";
import { serviceUpdateValidator } from "../validators/serviceUpdateValidator";

const router = Router();

//add services
router.post("/", verifyToken, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  req.body.active = true;
  if (req.body.sellingCost && req.body.taxRate) {
    req.body.includeTax =
      req.body.sellingCost * ((100 + req.body.taxRate) / 100);
  }
  const { value } = serviceCreateValidator(req.body);
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
router.get("/:id", getServices, (res) => {
  res.send(res.service);
});

router.patch("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: "Service not found!" });
  }

  const { value } = serviceUpdateValidator(req.body);
  try {
    const updatedService = await Service.updateOne({ _id: service.id }, value);
    res.status(201).json(updatedService._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//get all services
router.get("/", async (res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ message: "Service not found!" });
  }

  try {
    const deletedService = await Service.deleteOne({ _id: service.id });
    res.json(deletedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//middleware
async function getServices(req, res, next) {
  let service;
  try {
    service = await findById(req.params.id);
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
