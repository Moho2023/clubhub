const fs = require("fs");
const short = require("short-uuid");

//setup google drive upload
const {google} = require('googleapis');
const KEYS = __dirname+"/../config/credentials.json";
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
    keyFile: KEYS,
    scopes: SCOPES
});
const driveService = google.drive({version: 'v3', auth});
//naming files and location in drive


exports.getAllClubs = function(){
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  return allClubs;
}

exports.createClub = async function(prop, file){
  //create new club ID
  //
  let newClubID = short.generate();
  let filePath = __dirname+"/../"+file.path;
  //naming files and location in drive
  let fileMetadata = {
    'name': newClubID+'_thumbnail.png',
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
  let thumbnail = "";
  switch(response.status){
   case 200:
       thumbnail = "https://drive.google.com/uc?export=view&id="+response.data.id;
       console.log(thumbnail)
       break;
   default:
       console.error('Error creating the file, ' + response.errors);
       break;
  }

  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  let newClub = {
  "clubname": prop.clubName,
  "clubID": newClubID,
  "category": prop.category,
  "facultyAdvisorEmail": prop.advisorEmail,
  "approved": false,
  "description": prop.description,
  "thumbnail": thumbnail,
  "leaders": {
    "leader1Email": prop.leaders[0],
    "leader2Email": prop.leaders[1],
    'leader3Email': prop.leaders[2],
    'leader4Email': prop.leaders[3]
  },
  "members": [], //start with only members being the leaders
  "clubImages": [thumbnail], //start with just the image of the thumbnail
  "announcements": [],
  "emails": []
  }
  allClubs[newClubID] = newClub;
  fs.writeFileSync(__dirname+'/../data/clubs.json', JSON.stringify(allClubs));
  return newClub;
}

exports.updateClub = function(updates){
  let clubID = updates.clubID
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  allClubs[clubID].leaders.leader1Email = updates.leader1Email
  allClubs[clubID].leaders.leader2Email = updates.leader2Email
  allClubs[clubID].leaders.leader3Email = updates.leader3Email
  allClubs[clubID].leaders.leader4Email = updates.leader4Email
  allClubs[clubID].description = updates.description
  allClubs[clubID].clubname = updates.clubName
  fs.writeFileSync(__dirname+'/../data/clubs.json', JSON.stringify(allClubs))
  console.log(allClubs[clubID])
}


exports.getClub = function(clubID){
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  return allClubs[clubID];
}

exports.getClubEvents = function(clubID){
  let allEventsJSON = JSON.parse(fs.readFileSync(__dirname+'/../data/events.json'));
  let allEvents = allEventsJSON.events //array
  let arrayOfClubEvents = []
  allEvents.forEach(element => {
    let url = element.url
    let clubIDFromUrl = url.slice(16);
    if(clubIDFromUrl == clubID){
    arrayOfClubEvents.push({
      "title": element.title,
      "url": element.url,
      "start": element.start
    })
  }
   })
   return arrayOfClubEvents
}

exports.joinClub = function(clubID, email){
  let allClubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  allClubs[clubID].members.push(email);
  fs.writeFileSync(__dirname+'/../data/clubs.json', JSON.stringify(allClubs))
}

exports.getUserAnnouncements = function(email){

}
