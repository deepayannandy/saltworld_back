import { Router } from "express";
import Client from "../models/clientModel.js";
import verifyToken from "../validators/verifyToken.js";
import { createTransport } from "nodemailer";
import { format, addMinutes } from "date-fns";
import { clientAppointmentCreateValidator } from "../validators/clientAppointmentCreateValidator.js";
import Membership from "../models/membershipsModel.js";
import Service from "../models/servicesModel.js";
import { clientAppointmentRescheduleValidator } from "../validators/clientAppointmentRescheduleValidator.js";
import emailLogModel from "../models/emailLogModel.js";
import appointmentModel from "../models/apointmentModel.js";
import _ from "lodash";
import moment from 'moment';
import userModel from "../models/userModel.js";
import { google } from "googleapis";
const {OAuth2} = google.auth


const router = Router();
const attendees=[
  {   "id": '0',
      "email": "saltworld.acc@gmail.com",
      "displayName": "Salt World",
      "organizer": true,
  }, 
  {
  "id": '1',
  "email": 'dnyindia@gmail.com',
  "displayName": 'DNYIndia',
  "organizer": false,
}, 
{
  "id": '2',
  "email": 'nrajesh.cts@gmail.com',
  "displayName": 'Rajesh',
  "organizer": false,
}, 
{
  "id": '3',
  "email": 'babu.deepthi@gmail.com',
  "displayName": 'Deepthi Babu',
  "organizer": false,
}, 
{
  "id": '4',
  "email": 'admin@sw.in',
  "displayName": 'SW Reception',
  "organizer": false,
}, 
]
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "saltworld.acc@gmail.com",
    pass: process.env.MAILER_PASS,
  },
  port: 465,
  host: "smtp.gmail.com",
});

process.env.TZ = "Asia/Calcutta";
 
function createCalenderEvent(newAppointment, service, client){
  const oAuth2Client = new OAuth2(process.env.calender_clientId,process.env.calender_token)
      oAuth2Client.setCredentials({refresh_token:process.env.calender_refreshToken})
      const calender= google.calendar({version:'v3', auth:oAuth2Client})
      const event= {
        summary:newAppointment.title,
        location:"Salt World, Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN",
        description:`<p><b>Booking Details: </b></p>
      <b>Name:</b> ${client.firstName} ${client.lastName} <br> 
      <b>Start Date:</b> ${newAppointment.startDateTime} <br> 
      <b>End Date:</b> ${newAppointment.endDateTime} <br> 
      <b>Service(s):</b> ${service.name} <br> `,
        start:{
            dateTime:newAppointment.startDateTime,
            timeZone:"Asia/Kolkata"
    
        },
        end:{
            dateTime:newAppointment.endDateTime,
            timeZone:"Asia/Kolkata"
            
        },
        creator: {
        "id": "salt",
        "email": "saltworld.acc@gmail.com",
        "displayName": "Salt World",
        "self": true
        },
        attendees:attendees,
        colorId:1
    }
    console.log(process.env.calender_refreshToken)
    calender.events.insert({calendarId:"primary",resource:event},(error)=>{
      if(error) return console.error("Something went wrong! ", error)
          return console.log('Calender event created!')
    })
}

router.post("/:clientId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(500).json({ message: "Access Prohibited!" });
  }
  const user= await userModel.findById(req.tokendata._id)
  if(!user) return res.status(500).json({ message: "Access Prohibited!" });
  const bookedBy= user.firstName;
  const { value, error } = clientAppointmentCreateValidator(
    req.body.appointmentData
  );
  if (error) {
    return res.status(422).json({ message: error.message });
  }

  let client = await Client.findById(req.params.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client Data not found!" });
  }
  const userId=client._id
  const startDateTime = new Date(value[0].startDateTime);
  const startDate = format(startDateTime, "dd-MMM-yyyy");
  const startTime = format(startDateTime, "HH : mm");
  let services=""
  let bookingIds=""
  for (const data of value) {
    const startDateTime = new Date(data.startDateTime);
    const endDateTime = addMinutes(startDateTime, data.duration);
    const service = await Service.findById(data.serviceId);
    const resource = service.resourceType;
    const rescheduleCount = 0;
    let membership;
    if (data.membershipId) {
      membership = await Membership.findById(data.membershipId);
    }
    if(data.duration<1){
      return res.status(500).json({ message: `Not able to book an appointment for ${service.name}` });
    }

    const formattedStartDateTime = startDateTime.toString();
    const membershipName = membership ? ` (${membership.name})` : "";
    const title = `${service.name}${membershipName} for ${client.firstName} ${client.lastName} at ${formattedStartDateTime}`;
    services=services+`${service.name}, `
    const isCancelled=false;
    for(let memberC in client.clientMemberships){
      if(client.clientMemberships[memberC]._id.equals(data.membershipId)){
        for(let serviceC in client.clientMemberships[memberC].services){
          if(client.clientMemberships[memberC].services[serviceC]._id.equals(data.serviceId)){
           client.clientMemberships[memberC].services[serviceC].sessions=client.clientMemberships[memberC].services[serviceC].sessions-1;
           break
          }
        }
        break
      }
    }
    let newAppointment = new appointmentModel({
      ...data,
      isCancelled,
      title,
      resource,
      rescheduleCount,
      endDateTime,
      bookedBy,userId
    })



    try {
      let appointment = await newAppointment.save();
      createCalenderEvent(newAppointment, service,client)
      bookingIds=bookingIds+" "+appointment._id
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
  try{
    const message=`<p><b>Dear ${client.firstName},</b></p>

      <p>Thank you for choosing Salt World for your wellness needs! We are delighted to confirm your booking and look forward to providing you with an exceptional rejuvenating and relaxing experience.</p>
      
      <p><b>Booking Details: </b></p>
      <b>Name:</b> ${client.firstName} ${client.lastName} <br> 
      <b>Date:</b> ${startDate} <br> 
      <b>Time:</b> ${startTime} <br> 
      <b>Service(s):</b>  ${services} <br> 
      <b>Location:</b> Salt World, Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN<br> <br> 
      <b>booking ref:</b>  ${ bookingIds.substring(bookingIds.length - 8)} <br> 
      Google Map: <a href="http://tinyurl.com/saltworld">http://tinyurl.com/saltworld</a>
      
      <h4><p>Important Information:</p></h4>
      
      <p><b>Arrival:</b> Please arrive at least <b>30 minutes before your appointment time</b></p>
      
      <p>Kindly note that <b>perfumes / flowers / smelling substances should be avoided</b> while entering Salt World. This is because others can be allergic to certain smells.</p>
      
      <p>Please wear comfortable clothing while you are relaxing in Salt cave. Do not wear tight clothes that creates difficulty in breathing. Wet clothes are not allowed. So, in case of rains, please get an extra set of clothes.</p>
      
      <p><b>Contact Us:</b><br> If you have any questions or need further assistance, please feel free to WhatsApp us at +91 76878 78793 / <a href="https://wame.pro/saltworld">https://wame.pro/saltworld</a> . Our team is here to ensure you have a seamless and enjoyable experience.</p>
      
      <p>We look forward to welcoming you to Salt World!</p>
      
      <p>Warm regards, <br>Your friendly team <br>Salt World <br>+91 76878 78793 / WhatsApp:<a href="https://wame.pro/saltworld"> https://wame.pro/saltworld</a> 
        <br>
      <a href="www.saltworld.in">www.saltworld.in</a></p>`

      const mail = {
        from: "saltworld.acc@gmail.com",
        to: client.email,
        subject: `Your appointment at Salt World is confirmed! `,
        html:message,
      };
      transporter.sendMail(mail, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);

        }
      });
      
      const emailCom= new emailLogModel({
        userId: client._id,
        userEmail: client.email,
        bookingId: bookingIds,
        emailBody: message,
        emailType: "New Appointment",
        timeStamp: new Date(),
        isSuccessfullySend:true
      })
      let communication = await emailCom.save();

  }catch(error){
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({ message: "Appointments added successfully" });
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
    const appointmentData = appointment?.toObject();

    return appointmentData._id.toString() === req.params.id;
  });

  if (!appointment) {
    return res.status(404).json({ message: "Appointment data not found!" });
  }
  let membership
  console.log(appointment.membershipId)
  console.log(appointment.membershipId!=undefined && appointment.membershipId.length>0);
  try{
   if(appointment.membershipId!=undefined && appointment.membershipId.length>0) membership = await Membership.findById(appointment.membershipId);
  }catch(e){
    console.log(e)
  }
  const services = [];
  if (membership) {
    for (const serviceId of membership.serviceIds) {
      const service = await Service.findById(serviceId);
      services.push(service?.toObject());
    }
  } else {
    const servicesData = await Service.find();
    for (const service of servicesData) {
      services.push(service?.toObject());
    }
  }
  const service = await Service.findById(appointment.serviceId);

  const membershipData = membership
    ? { membership: membership?.toObject() }
    : {};
  appointment = Object.assign({}, appointment?.toObject(), {
    client: _.omit(client?.toObject(), [
      "clientMemberships",
      "appointments",
      "notes",
    ]),
    ...membershipData,
    service: service?.toObject(),
    services,
  });
  appointment.clientId = client.id;

  res.send(appointment);
});
// get a appointments by Client Id
router.get("/by-appointment/:appointmentId", verifyToken, async (req, res) => {
  if (req.tokendata.userType !== "Admin") {
    return res.status(403).json({ message: "Access Prohibited!" });
  }
    try{
      console.log(req.params.appointmentId)
      const appointmentData= await appointmentModel.findById(req.params.appointmentId);
      if(!appointmentData) return res.status(404).json({ message: "Appointment data not found!" });
      const client= await Client.findById(appointmentData.userId)
      const serviceName= appointmentData.serviceId!="historical Data"? await Service.findById(appointmentData.serviceId):"Historical Data"
      if(appointmentData.isCancelled){ 
        let userData= await userModel.findById(appointmentData.cancelledBy)
        if(userData) appointmentData.cancelledBy= `${userData.firstName} ${userData.lastName}`
      }
      let finaldata={appointmentData,client,serviceName}
      return res.send(finaldata);
    }catch(error){
      res.status(500).json({ message: error.message });
    }
});

// get a appointments by Client Id
router.get("/client/:clientId", verifyToken, async (req, res) => {
  try{
    const appointmentData= await appointmentModel.find({userId:req.params.clientId})
    let formattedAppointments=[];
    for(let index in  appointmentData){
      const date = format(appointmentData[index].startDateTime, "dd-MMM-yyyy");
      const startTime = format(appointmentData[index].startDateTime, "hh:mm a");
      const endTime = format(appointmentData[index].endDateTime, "hh:mm a");
      const ismembership = appointmentData[index].membershipId?"Yes":"No";
      const status =
      appointmentData[index].isCancelled==true?"Cancelled": new Date() < appointmentData[index].startDateTime
          ? "Upcoming"
          : new Date() > appointmentData[index].endDateTime
          ? "Completed"
          : "Live";
      formattedAppointments.push(Object.assign({}, appointmentData[index]?.toObject(), {
        date,
        startTime,
        endTime,
        status,
        ismembership
      }))
    }
    res.json(formattedAppointments);
} catch (error) {
  res.status(500).json({ message: error.message });
}
});

//get all appointments
// router.get("/", verifyToken, async (req, res) => {
 
// });

//get all appointments
// router.get("/byday/:date", verifyToken, async (req, res) => {

// });

// get all appointments
// router.get("/existing/:time&:serviceId&:duration",
//   verifyToken,
//   async (req, res) => {
//     if (req.tokendata.userType !== "Admin") {
//       return res.status(400).json({ message: "Access Prohibited!" });
//     }
//     const startDateTime = new Date(req.params.time);
//     const endDateTime = addMinutes(startDateTime, req.params.duration);

//     try {
//       const clients = await Client.find();

//       let allAppointments = [];
//       for (const client of clients) {
//         const appointments = client.appointments.filter((appointment) => {
//           appointment.clientId = client.id;

//           if (
//             appointment.startDateTime >= startDateTime &&
//             appointment.startDateTime <= endDateTime &&
//             appointment.serviceId === req.params.serviceId
//           ) {
//             return true;
//           }
//           return false;
//         });

//         allAppointments = allAppointments.concat(appointments);
//       }

//       res.json(allAppointments);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

router.get("/searchbyview/:starttime&:endtime",
  verifyToken,
  async (req, res) => {
    if (req.tokendata.userType !== "Admin") {
      return res.status(400).json({ message: "Access Prohibited!" });
    }
    let startDate= moment(`${req.params.starttime} 00:00:00`, 'DD-MM-YYYY HH:mm:ss').toDate()
    let endDate= moment(`${req.params.endtime} 23:59:00`, 'DD-MM-YYYY HH:mm:ss').toDate()
    
    console.log(startDate,endDate)

    try{  
      const appointmentData= await appointmentModel.find({$and:
        [{startDateTime:{
           $gt: startDate,
           $lt: endDate
       }},{
           isCancelled:false
       }]})
      res.json(appointmentData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
router.get(
  "/searchbydate/:starttime&:endtime&:branch",
  verifyToken,
  async (req, res) => {
    if (req.tokendata.userType !== "Admin") {
      return res.status(400).json({ message: "Access Prohibited!" });
    }

    const startDateTime = new Date(req.params.starttime);
    const endDateTime = new Date(req.params.endtime);
    startDateTime.setHours(0,0,0)
    endDateTime.setHours(23,59,59)
    console.log(startDateTime,endDateTime)
    try {
      const appointmentData= await appointmentModel.find({$and:
        [{startDateTime:{
           $gt: startDateTime,
           $lt: endDateTime
       }},{
        branch:req.params.branch
       }]
   })
      res.json(appointmentData);
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
  const appointment= await appointmentModel.findById(req.params.id)
  if (!appointment) {
    return res.status(404).json({ message: "Client appointment not found" });
  }

  const { value } = clientAppointmentRescheduleValidator(req.body);
  const service = await Service.findById(value.serviceId);
  const resource = service.resourceType;
  const rescheduleCount = appointment.rescheduleCount + 1;

  const startDateTime = new Date(value.startDateTime);
  const endDateTime = addMinutes(startDateTime, service.duration);

  const clients = await Client.find();
  const formattedStartDateTime = startDateTime.toString();
  const title = `${service.name} for ${client.firstName} ${client.lastName} at ${formattedStartDateTime}`;
  appointment.endDateTime= endDateTime
  appointment.startDateTime=startDateTime
  appointment.rescheduleCount= rescheduleCount
  appointment.personCount= req.body.personCount
  try {
    await appointment.save();
    const startDate = format(startDateTime, "dd-MMM-yyyy");
    const startTime = format(startDateTime, "HH : mm");
      const message=`<p><b>Dear ${client.firstName},</b></p>

      <p>Thank you for choosing Salt World for your wellness needs! We would like to inform you that your original appointment is rescheduled. We look forward to providing you with an exceptional rejuvenating and relaxing experience.</p>
      
      <p><b>Booking Details: </b></p>
      <b>Name:</b> ${client.firstName} ${client.lastName} <br> 
      <b>Date:</b> ${startDate} <br> 
      <b>Time:</b> ${startTime} <br> 
      <b>Service(s):</b>  ${service.name} <br> 
      <b>Location:</b> Salt World, Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN<br> <br> 
      
      Google Map: <a href="http://tinyurl.com/saltworld">http://tinyurl.com/saltworld</a>
      
      <h4><p>Important Information:</p></h4>
      
      <p><b>Arrival:</b> Please arrive at least <b>30 minutes before your appointment time</b></p>
      
      <p>Kindly note that <b>perfumes / flowers / smelling substances should be avoided</b> while entering Salt World. This is because others can be allergic to certain smells.</p>
      
      <p>Please wear comfortable clothing while you are relaxing in Salt cave. Do not wear tight clothes that creates difficulty in breathing. Wet clothes are not allowed. So, in case of rains, please get an extra set of clothes.</p>
      
      <p><b>Contact Us:</b><br> If you have any questions or need further assistance, please feel free to WhatsApp us at +91 76878 78793 / <a href="https://wame.pro/saltworld">https://wame.pro/saltworld</a> . Our team is here to ensure you have a seamless and enjoyable experience.</p>
      
      <p>We look forward to welcoming you to Salt World!</p>
      
      <p>Warm regards, <br>Your friendly team <br>Salt World <br>+91 76878 78793 / WhatsApp:<a href="https://wame.pro/saltworld"> https://wame.pro/saltworld</a> 
        <br>
      <a href="www.saltworld.in">www.saltworld.in</a></p>`
    const mail = {
      from: "saltworld.acc@gmail.com",
      to: client.email,
      subject: `Your appointment at Salt World is rescheduled! `,
      html:message,
    };

    transporter.sendMail(mail, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);

      }
    });
    const emailCom= new emailLogModel({
      userId: client._id,
      userEmail: client.email,
      bookingId: appointment._id,
      emailBody: message,
      emailType: "Reschedule",
      timeStamp: new Date(),
      isSuccessfullySend:true
    })
    let communication = await emailCom.save();
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
  const appointment= await appointmentModel.findById(req.params.id)
  if (!appointment) {
    return res.status(404).json({ message: "Client appointment not found" });
  }
  if(appointment.membershipId? appointment.membershipId.length>0 :false){
    console.log("This need to be reimbursed");
    client.clientMemberships=client.clientMemberships.map((membership)=>{
      if(membership._id.equals(selectedAppointment.membershipId)){
        let temp_services=membership.services.map((service)=>{
          if(service._id.equals(selectedAppointment.serviceId))
          {
            console.log(service.name)
            service.sessions=service.sessions+1
            return service
          }
          return service
        })
        membership.services=temp_services;
        console.log(membership);
        return membership
      }
      return membership
    })
  }
  
  const startDateTime = new Date(appointment.startDateTime);

  try {
    await client.save();
    appointment.isCancelled=true;
    appointment.cancelledBy=req.tokendata._id;
    appointment.cancelledOn=new Date();
    appointment.save()
    const startDate = format(startDateTime, "dd-MMM-yyyy");
    const startTime = format(startDateTime, "HH : mm");
    const service = await Service.findById(appointment.serviceId);
    const message=`<p><b>Dear ${client.firstName},</b></p>

      <p>Your below appointment is cancelled. We look forward to host you soon</p>
      
      <p><b>Booking Details: </b></p>
      <b>Name:</b> ${client.firstName} ${client.lastName} <br> 
      <b>Date:</b> ${startDate} <br> 
      <b>Time:</b> ${startTime} <br> 
      <b>Service(s):</b>  ${service.name} <br> 
      <b>Location:</b> Salt World, Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN<br> <br> 
      
      <p><b>Contact Us:</b><br> If you have any questions or need further assistance, please feel free to WhatsApp us at +91 76878 78793 / <a href="https://wame.pro/saltworld">https://wame.pro/saltworld</a> . Our team is here to ensure you have a seamless and enjoyable experience.</p>
      
      <p>We look forward to welcoming you to Salt World!</p>
      
      <p>Warm regards,<br> Your friendly team <br>Salt World<br>+91 76878 78793 / WhatsApp:<a href="https://wame.pro/saltworld"> https://wame.pro/saltworld</a> 
        <br>
      <a href="www.saltworld.in">www.saltworld.in</a></p>`
    const mail = {
      from: "saltworld.acc@gmail.com",
      to: client.email,
      subject: `Your appointment at Salt World is cancelled!`,
      html:message,
    };
    transporter.sendMail(mail, function (error, info) {
      if (error) {
        console.log(error);

      } else {
        console.log("Email sent: " + info.response);
       
      }
    });
    const emailCom= new emailLogModel({
      userId: client._id,
      userEmail: client.email,
      bookingId: appointment._id,
      emailBody: message,
      emailType: "Cancellation",
      timeStamp: new Date(),
      isSuccessfullySend:true,
    })
    let communication = await emailCom.save();
    res.status(201).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
