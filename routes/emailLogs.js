import { Router } from "express";
import EmailLog from "../models/emailLogModel.js";
import { createTransport } from "nodemailer";
import { format, addMinutes } from "date-fns";

const transporter = createTransport({
    service: "gmail",
    secure:true,
    auth: {
        type: "login", 
      user: "saltworld.acc@gmail.com",
      pass: process.env.MAILER_PASS,
    },
    port: 465,
    host: "smtp.gmail.com",
  });
  
  process.env.TZ = "Asia/Calcutta";

  
const router = Router();

//get all emailLogs
router.get('/',async (req,res)=>{
    try{
        const emailLogs=(await EmailLog.find()).reverse
        return res.json(emailLogs)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/:cid',async (req,res)=>{
  try{
      // console.log(req.params.cid)
      const emailLogs=await EmailLog.find({userId:req.params.cid})
      // console.log(await EmailLog.find({userId:req.params.cid}))
      return res.json(emailLogs.reverse())
  }catch(error){
      res.status(500).json({message: error.message})
  }
})

router.post('/:email',async (req,res)=>{
    const startDate = format(new Date(), "dd-MMM-yyyy");
    const startTime= format(new Date(), "HH:mm");
    const message=`<p><b>Dear Deepayan Nandy,</b></p>

<p>Thank you for choosing Salt World for your wellness needs! We are delighted to confirm your booking and look forward to providing you with an exceptional rejuvenating and relaxing experience.</p>

<p><b>Booking Details: </b></p>
<b>Name:</b> Deepayan Nandy <br> 
<b>Date:</b> ${startDate} <br> 
<b>Time:</b> ${startTime} <br> 
<b>Service(s):</b>  Salt Cave Therapy <br> 
<b>Location:</b> Salt World, Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN<br> <br> 

Google Map: <a href="http://tinyurl.com/saltworld">http://tinyurl.com/saltworld</a>

<h4><p>Important Information:</p></h4>

<p><b>Arrival:</b> Please arrive at least <b>30 minutes before your appointment time</b></p>

<p>Kindly note that <b>perfumes / flowers / smelling substances should be avoided</b> while entering Salt World. This is because others can be allergic to certain smells.</p>

<p>Please wear comfortable clothing while you are relaxing in Salt cave. Do not wear tight clothes that creates difficulty in breathing. Wet clothes are not allowed. So, in case of rains, please get an extra set of clothes.</p>

<p><b>Contact Us:</b><br> If you have any questions or need further assistance, please feel free to WhatsApp us at +91 76878 78793 / <a href="https://wame.pro/saltworld">https://wame.pro/saltworld</a> . Our team is here to ensure you have a seamless and enjoyable experience.</p>

<p>We look forward to welcoming you to Salt World!</p>

<p>Warm regards, Your friendly team Salt World +91 76878 78793 / WhatsApp:<a href="https://wame.pro/saltworld"> https://wame.pro/saltworld</a> 
	<br>
<a href="www.saltworld.in">www.saltworld.in</a></p>`
    const mail = {
        from: "saltworld.acc@gmail.com",
        to: req.params.email,
        subject: `Your appointment at Salt World is confirmed! `,
        html: message,
      };
      transporter.sendMail(mail, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
    })
    res.status(200).json({message: `Sending to ${req.params.email}`})

})

export default router;
