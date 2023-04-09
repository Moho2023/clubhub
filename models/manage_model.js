const fs = require("fs");
const short = require("short-uuid");
const dateTime = require("date-and-time")
const CLUBS = require('./clubs_model.js')
const {google} = require('googleapis');
const KEYS = __dirname+"/../config/credentials.json";
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
    keyFile: KEYS,
    scopes: SCOPES
});
const driveService = google.drive({version: 'v3', auth});

exports.getAllClubs = function(){
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  return allClubs;
}


exports.createAnnouncement = function(announcement_deets, datetime){
  let clubID = announcement_deets.clubID
  let allClubs = exports.getAllClubs()
  let announcement_item = {
    "subject": announcement_deets.subject,
    "announcement": announcement_deets.announcement,
    "date": dateTime.format(datetime, 'ddd MMMM DD YYYY at hh:mm A')
  }
  allClubs[clubID].announcements.unshift(announcement_item);
  fs.writeFileSync(__dirname+'/../data/clubs.json', JSON.stringify(allClubs));
}

exports.sendEmailAnnouncement = function(){
  return 0;
}

exports.getUserRole = function(useremail){
  let allEmails = JSON.parse(fs.readFileSync(__dirname+'/../data/emails.json'));
  let role = allEmails[useremail]
  return role
}

exports.createEvent = function(eventDetails){
  let allEvents = JSON.parse(fs.readFileSync(__dirname+'/../data/events.json'));
  let eventsArray = allEvents.events
  let time = eventDetails.date + "T" + eventDetails.time + ":00"
  let newEvent = {
    "title": `|${eventDetails.location}| ${eventDetails.clubname}` ,
    "url": `/clubs/viewclub/${eventDetails.clubID}`,
    "start": time
  }
  eventsArray.push(newEvent)
  allEvents.events = eventsArray
  fs.writeFileSync(__dirname+'/../data/events.json', JSON.stringify(allEvents));
}

exports.isLeader = function(email, clubID){
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  if(allClubs[clubID].leaders.leader1Email == email) return true;
  if(allClubs[clubID].leaders.leader2Email == email) return true;
  if(allClubs[clubID].leaders.leader3Email == email) return true;
  if(allClubs[clubID].leaders.leader4Email == email) return true;
  if(allClubs[clubID].facultyAdvisorEmail == email) return true;
  return false;
}

exports.isApproved = function(clubID) {
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  return allClubs[clubID].approved
}

exports.sendReimbursementRequest = async function(prop, file){
  let requestID = short.generate();
  let clubID = prop.clubID;
  let filePath = __dirname+"/../"+file.path;
  //naming files and location in drive
  let fileMetadata = {
    'name': "clubID:"+clubID+"____requestID:"+requestID+"___POP.png",
    'parents':  ['1hqYyWBRTyNCQYYY-Peurq0x3jqsN5OHg'] //folder id for where to upload my files
  };
  let media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath)
    };
  let response = await driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
  });
  let receiptlink = "";
  switch(response.status){
   case 200:
       receiptlink = "https://drive.google.com/uc?export=view&id="+response.data.id;
       console.log(receiptlink)
       break;
   default:
       console.error('Error creating the file, ' + response.errors);
       break;
  }

  let newReimbursement = {
    "clubID":prop.clubID,
    "amount":prop.money,
    "proofofpurchase":receiptlink,
    "budget_approved":false,
    "expenses":prop.expenses,
    "requestID": requestID
  }
  let allRequests = JSON.parse(fs.readFileSync(__dirname+'/../data/receipts.json'));
  allRequests[requestID] = newReimbursement
  fs.writeFileSync(__dirname+'/../data/receipts.json', JSON.stringify(allRequests));
  console.log(newReimbursement)
  return newReimbursement
}

exports.getAllReimbursementRequests = function(){
  let allRequests = JSON.parse(fs.readFileSync(__dirname+'/../data/receipts.json'));
  return allRequests;
}


/**
exports.createMeeting = function(clubID, datetime, ){

}
*/
