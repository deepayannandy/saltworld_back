var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'appsdny@gmail.com',
    pass: 'lqluebudwozpolck'
  },
  port:465,
  host:"smtp.gmail.com"
});

var regestereduserMail = {
  from: 'appsdny@gmail.com',
  to: 'deepayan.622@gmail.com',
  subject: 'Tire1Integrity || Onboarding process has been started ||',
  text: `Hi John,
Congratulation on your successful registration at Tire1Integrity. Your Profile is shared with the management team for an approval.

Your login id: johnsmith@gmail.com
Password: John@1234

* Do Not Share this mail *
        
We will let you know as soon as your profile got approved.

Thank you 
Team Tire1Integrity`      
};
var approveduserMail = {
  from: 'appsdny@gmail.com',
  to: 'deepayan.622@gmail.com',
  subject: 'Tire1Integrity || Onboarding process approved||',
  text: `Hi John,
Congratulation your profile has been approved at Tire1Integrity.

Thank you 
Team Tire1Integrity`      
};

var regestrationAdimnMail = {
    from: 'appsdny@gmail.com',
    to: 'dnyindia@gmail.com',
    subject: 'John Smith || Approvl needed',
    text: `Dear Management,
New onboarding employee waiting for your approval.

User Details
    Full name: John Smith
    Email: johnsmith@gmail.com
    Cost Centre: Pasadena, TX 77506
    Contact: 7384213622
  
* Do Not Share this mail with anyone else *
  
Thank you 
Team Tire1Integrity`      
  };
  


function sendMail(email){
    console.log(email);
}
// transporter.sendMail(regestereduserMail, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }});

// transporter.sendMail(regestrationAdimnMail, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
// });

transporter.sendMail(approveduserMail, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
sendMail("hello");
