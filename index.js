import dotenv from "dotenv";
import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";
import aws_sdk from "aws-sdk";

const app = express();
const { S3 } = aws_sdk;
const { connect, connection } = mongoose;
dotenv.config();

process.env.TZ = "Asia/Calcutta";
const region = process.env.region;
const bucketName = process.env.bucketName;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

connect(process.env.DATABASE_URL);
const db = connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database!"));

app.use(json());
app.use(cors());

import userRouter from "./routes/userAuth.js";
import branchOfficeRouter from "./routes/branchOffice.js";
import servicesRouter from "./routes/services.js";
import servicePackagesRouter from "./routes/servicePackages.js";
import clientsRouter from "./routes/clients.js";
import membershipsRouter from "./routes/memberships.js";
import clientAppointmentsRouter from "./routes/clientAppointments.js";
import notesRouter from "./routes/clientNotes.js";
import clientMembershipRouter from "./routes/clientMemberships.js";
import emaillogRouter from "./routes/emailLogs.js";
import testRouter from "./routes/testAPI.js";

app.use("/api/user", userRouter);
app.use("/api/branches", branchOfficeRouter);
app.use("/api/services", servicesRouter);
app.use("/api/servicepackages", servicePackagesRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/memberships", membershipsRouter);
app.use("/api/appointments", clientAppointmentsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/client_memberships", clientMembershipRouter);
app.use("/api/emailLogs",emaillogRouter);
app.use("/api/testAPI",testRouter);

app.get("/s3url/:name", async (req, res) => {
  const imagename = req.params.name;

  const params = {
    Bucket: bucketName,
    Key: imagename,
    Expires: 60,
  };
  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  res.send({ uploadUrl });
});

app.listen(6622, () => {
  console.log("Http Server is listening!");
});