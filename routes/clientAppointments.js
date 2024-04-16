import { Router } from "express";
import Client from "../models/clientModel.js";
import verifyToken from "../validators/verifyToken.js";
import { createTransport } from "nodemailer";
import { format, addMinutes } from "date-fns";
import { clientAppointmentCreateValidator } from "../validators/clientAppointmentCreateValidator.js";
import Membership from "../models/membershipsModel.js";
import Service from "../models/servicesModel.js";
import { clientAppointmentRescheduleValidator } from "../validators/clientAppointmentRescheduleValidator.js";
import _ from "lodash";

const router = Router();

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "appsdny@gmail.com",
    pass: process.env.MAILER_PASS,
  },
  port: 465,
  host: "smtp.gmail.com",
});

process.env.TZ = "Asia/Calcutta";

router.post("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const { value, error } = clientAppointmentCreateValidator(req.body.appointmentData);
  if (error) {
    return res.status(422).json({ message: error.message });
  }

    let client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: "Client Data not found!" });
    }
  
  for (const data of value) {
      const startDateTime = new Date(data.startDateTime);
      const endDateTime = addMinutes(startDateTime, data.duration);
      const membership = await Membership.findById(data.membershipId);
      const service = await Service.findById(data.serviceId);
      const resource = service.resourceType;
      const rescheduleCount = 0;
    
    const formattedStartDateTime = startDateTime.toString();
    const membershipName = membership ? ` (${membership.name})` : "";
    const title = `${service.name}${membershipName} for ${client.firstName} ${client.lastName} at ${formattedStartDateTime}`;

    client.appointments.push({
      ...data,
      title,
      resource,
      rescheduleCount,
      endDateTime,
    });

    try {
      client = await client.save();

      const latestClientAppointment = client.appointments.find(
        (appointment) => appointment.title === title
      );

      const startDate = format(startDateTime, "dd-MMM-yyyy");
      const mail = {
        from: "appsdny@gmail.com",
        to: client.email,
        subject: `🤗  Hi  ${client.firstName}, your appointment is confirmed!`,
        text: `Booking ref: ${latestClientAppointment._id}
                ${startDate} with Salt World

                Appointment details
                ${latestClientAppointment.title}

                Location
                Salt World
                Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN
                GPS: http://tinyurl.com/saltworld

                Cancellation / Reschedule policy
                    1. Reschedule is allowed 48 hours prior to the scheduled session, however under circumstances like high fever, monthly period cycle or any other health complications reschedule is still permitted before 3 hours of the scheduled session.
                    2. If the reschedule request is NOT received within the above-mentioned window, then it will be considered as session availed.
                    3. In case of cancellation due to unavoidable situations, if we receive the cancellation request before 3 hours of the scheduled session, we will provide the credit note, that can be availed within a year.
                    4. If the scheduled session is canceled, it cannot be provided back on the weekend / public holiday. It can be availed only on the weekdays.

                Important info
                Please be available at the location 30 minutes prior to your appointment. Please know that delays in reaching the location will impact the duration of the session.

                For any assistance dial / WhatsApp: +91 7687878793`,
      };
      transporter.sendMail(mail, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  return res.status(201).json({message: 'Appointments added successfully'});
});

//get a appointment
router.get("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.query.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  let appointment = client.appointments.find((appointment) => {
    const appointmentData = appointment.toObject();

    return appointmentData._id.toString() === req.params.id;
  });

  if (!appointment) {
    return res.status(404).json({ message: "Appointment data not found!" });
  }

  const membership = await Membership.findById(appointment.membershipId);
  const services = [];
  if (membership) {
    for (const serviceId of membership.serviceIds) {
      const service = await Service.findById(serviceId);
      services.push(service.toObject());
    }
  } else {
    const servicesData = await Service.find();
    for (const service of servicesData) {
      services.push(service.toObject());
    }
  }
  const service = await Service.findById(appointment.serviceId);

  const membershipData = membership ? { membership: membership.toObject() } : {};
  appointment = Object.assign({}, appointment.toObject(), {
    client: _.omit(client.toObject(), [
      "clientMemberships",
      "appointments",
      "notes",
    ]),
    ...membershipData,
    service: service.toObject(),
    services,
  });
  appointment.clientId = client.id;

  res.send(appointment);
});

//get a appointments by Client Id
router.get("/client/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  try {
    const appointmentsData = client.appointments.map((appointment) => {
      const date = format(appointment.startDateTime, "dd-MMM-yyyy");
      const startTime = format(appointment.startDateTime, "hh:mm a");
      const endTime = format(appointment.endDateTime, "hh:mm a");
      const status =
        new Date() < appointment.startDateTime
          ? "Upcoming"
          : new Date() > appointment.endDateTime
          ? "Completed"
          : "Live";

      return Object.assign({}, appointment.toObject(), {
        clientId: client.id,
        date,
        startTime,
        endTime,
        status,
      });
    });
    res.send(appointmentsData);
  } catch (e) {
    res.status(404).send({ message: "Something went wrong" });
  }
});

//get all appointments
router.get("/", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }

  try {
    const clients = await Client.find();

    let allAppointments = [];
    for (const client of clients) {
      const appointments = client.appointments.map((appointment) => {
        appointment = appointment.toObject();
        appointment["clientId"] = client.id;
        return appointment;
      });

      allAppointments = allAppointments.concat(appointments);
    }

    res.json(allAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all appointments
router.get(
  "/existing/:time&:serviceId&:duration",
  verifyToken,
  async (req, res) => {
    if (req.tokendata.userType !== "Admin") {
      return res.status(400).json({ message: "Access Prohibited!" });
    }
    const startDateTime = new Date(req.params.time);
    const endDateTime = addMinutes(startDateTime, req.params.duration);

    try {
      const clients = await Client.find();

      let allAppointments = [];
      for (const client of clients) {
        const appointments = client.appointments.filter((appointment) => {
          appointment.clientId = client.id;

          if (
            appointment.startDateTime >= startDateTime &&
            appointment.startDateTime <= endDateTime &&
            appointment.serviceId === req.params.serviceId
          ) {
            return true;
          }
          return false;
        });

        allAppointments = allAppointments.concat(appointments);
      }

      res.json(allAppointments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/searchbydate/:starttime&:endtime&:branch",
  verifyToken,
  async (req, res) => {
    if (req.tokendata.userType !== "Admin") {
      return res.status(400).json({ message: "Access Prohibited!" });
    }

    const startDateTime = new Date(req.params.starttime);
    const endDateTime = new Date(req.params.endtime);
    try {
      const clients = await Client.find();

      let allAppointments = [];
      for (const client of clients) {
        const appointments = client.appointments.filter((appointment) => {
          appointment.clientId = client.id;

          if (
            appointment.startDateTime >= startDateTime &&
            appointment.startDateTime <= endDateTime &&
            appointment.branch === req.params.branch
          ) {
            return true;
          }
          return false;
        });

        allAppointments = allAppointments.concat(appointments);
      }

      res.json(allAppointments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

//reschedule
router.patch("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.body.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }

  if (!client.appointments?.length) {
    return res.status(404).json({ message: "Client appointments not found" });
  }

  const appointment = client.appointments.find(
    (appointment) => appointment._id.toString() === req.params.id
  );
  if (!appointment) {
    return res.status(404).json({ message: "Client appointment not found" });
  }

  const { value } = clientAppointmentRescheduleValidator(req.body);

  const membership = await Membership.findById(value.membershipId);
  const service = await Service.findById(value.serviceId);
  const resource = service.resourceType;
  const rescheduleCount = appointment.rescheduleCount + 1;

  const startDateTime = new Date(value.startDateTime);
  const endDateTime = addMinutes(startDateTime, service.duration);

  const formattedStartDateTime = startDateTime.toString();
  const membershipName = membership ? ` (${membership.name})` : "";
  const title = `${service.name}${membershipName} for ${client.firstName} ${client.lastName} at ${formattedStartDateTime}`;

  client.appointments = client.appointments.map((appointment) => {
    if (appointment._id.toString() === req.params.id) {
      appointment = Object.assign({}, appointment, {
        ..._.omit(value, 'clientId'),
        endDateTime,
        resource,
        rescheduleCount,
        title,
      });
    }

    return appointment;
  });

  try {
    await client.save();

    const mail = {
      from: "appsdny@gmail.com",
      to: client.email,
      subject: `⌛ Hi ${client.firstName}, your appointment has been rescheduled!`,
      text: `Booking ref: ${appointment._id}
              Your appointment with Salt World is now booked for ${startDateTime}
                          
              Appointment details
              ${appointment.title}
                          
              Location
              Salt World
              Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN
              GPS: http://tinyurl.com/saltworld
                          
              Cancellation / Reschedule policy
              1. Reschedule is allowed 48 hours prior to the scheduled session, however under circumstances like high fever, monthly period cycle or any other health complications reschedule is still permitted before 3 hours of the scheduled session.
              2. If the reschedule request is NOT received within the above-mentioned window, then it will be considered as session availed.
              3. In case of cancellation due to unavoidable situations, if we receive the cancellation request before 3 hours of the scheduled session, we will provide the credit note, that can be availed within a year.
              4. If the scheduled session is canceled, it cannot be provided back on the weekend / public holiday. It can be availed only on the weekdays.

              Important info
              Please be available at the location 30 minutes prior to your appointment. Please know that delays in reaching the location will impact the duration of the session.

              For any assistance dial / WhatsApp: +91 7687878793`,
    };
    transporter.sendMail(mail, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.status(201).json(appointment._id);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete schedule
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(400).json({ message: "Access Prohibited!" });
  }

  const client = await Client.findById(req.body.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  if (!client.appointments?.length) {
    return res.status(404).json({ message: "Client appointments not found" });
  }

  const appointment = client.appointments.find(
    (appointment) => appointment._id === req.params.id
  );
  if (!appointment) {
    return res.status(404).json({ message: "Client appointment not found" });
  }

  client.appointments = client.appointments.filter(
    (appointment) => appointment.id !== req.params.id
  );

  try {
    await client.save();

    const mail = {
      from: "appsdny@gmail.com",
      to: client.email,
      subject: `🥺 Hi ${client.firstName}, your appointment has been canceled`,
      text: `Booking ref: ${appointment._id}
              Appointment was scheduled for ${appointment.startDateTime} with Salt World
                          
              Appointment details
              ${appointment.title}
                          
              Location
              Salt World
              Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN
              GPS: http://tinyurl.com/saltworld
                          
              Cancellation / Reschedule policy
              1. Reschedule is allowed 48 hours prior to the scheduled session, however under circumstances like high fever, monthly period cycle or any other health complications reschedule is still permitted before 3 hours of the scheduled session.
              2. If the reschedule request is NOT received within the above-mentioned window, then it will be considered as session availed.
              3. In case of cancellation due to unavoidable situations, if we receive the cancellation request before 3 hours of the scheduled session, we will provide the credit note, that can be availed within a year.
              4. If the scheduled session is canceled, it cannot be provided back on the weekend / public holiday. It can be availed only on the weekdays.

              Important info
              Please be available at the location 30 minutes prior to your appointment. Please know that delays in reaching the location will impact the duration of the session.

              For any assistance dial / WhatsApp: +91 7687878793`,
    };
    transporter.sendMail(mail, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.status(201).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
