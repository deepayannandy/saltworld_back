import dotenv from "dotenv";
import cors from "cors";
import express, { json } from "express";
import mongoose from "mongoose";

const app = express();
const { connect, connection } = mongoose;
dotenv.config();

process.env.TZ = "Asia/Calcutta";

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
import dashboardRouter from "./routes/dashboard.js";

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
app.use("/api/dashboard",dashboardRouter);


app.listen(6622, () => {
  console.log("Http Server is listening!");
});