import { Router } from "express";
import verifyToken from "../validators/verifyToken.js";
import Client from "../models/clientModel.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
    if (req.tokendata.userType !== "Admin") {
      return res.status(500).json({ message: "Access Prohibited!" });
    }
    try {
        const clientCount = await Client.countDocuments();
        res.status(201).json({ "clientCount": clientCount});
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})

export default router;