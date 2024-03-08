import { format } from "date-fns";
import { Router } from "express";
import verifyToken from "../validators/verifyToken.js";
import { clientNotesCreateValidator } from "../validators/clientNotesCreateValidator.js";
import Client from "../models/clientModel.js";
import _ from "lodash";

const router = Router();

//add services
router.post("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  const now = new Date();
  const { value } = clientNotesCreateValidator(req.body);

  try {
    client.notes.push({ ...value, date: now, author: req.tokendata._id });
    await client.save();

    res.status(200).json(client.notes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.UserType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  try {
    let clientNotesData = client.notes.map((clientNote) => {
      const data = clientNote.toObject();
      data.date = format(clientNote.date, "dd MMM yyyy hh:mm:ss");
      return data;
    });
    clientNotesData = _.orderBy(clientNotesData, 'date', 'desc');

    res.json(clientNotesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
