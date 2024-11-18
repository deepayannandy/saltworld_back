import { Router } from "express";
import verifyToken from "../validators/verifyToken.js";
import Client from "../models/clientModel.js";
import appointmentModel from "../models/apointmentModel.js";
const router = Router();

router.get("/", verifyToken, async (req, res) => {
    if (req.tokendata.userType !== "Admin") {
      return res.status(500).json({ message: "Access Prohibited!" });
    }
    try {
        const clientCount = await Client.countDocuments();
        var start = new Date();
        start.setHours(0,0,0,0);

        var end = new Date();
        end.setHours(23,59,59,999);
        console.log(start, end)
        const todaysAppointments= await appointmentModel.countDocuments({$and:
          [{startDateTime:{
             $gt: start,
             $lt: end
         }},{
             isCancelled:false
         }]})
        res.status(201).json({ "clientCount": clientCount,"todaysAppointments":todaysAppointments});
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})

export default router;