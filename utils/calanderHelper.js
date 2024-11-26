import { google } from 'googleapis'
const {OAuth2} = google.auth
import dotenv from "dotenv";
dotenv.config();

const oAuth2Client = new OAuth2(process.env.calender_clientId,process.env.calender_token)
oAuth2Client.setCredentials({refresh_token:process.env.calender_refreshToken})
const calender= google.calendar({version:'v3', auth:oAuth2Client})

function createCalenderEvent(appointmentData){
    console.log(appointmentData)
}

module.exports.createCalenderEvent= createCalenderEvent;