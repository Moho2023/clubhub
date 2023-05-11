const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname+'/../data/admin_dash.db');


exports.isAdmin = function(email){
  let emails = JSON.parse(fs.readFileSync(__dirname+'/../data/emails.json'));
  for(let user in emails){
    if(emails[user] == "admin"){
      return true
    }
  }
  return false
}

exports.approveClub = function(clubID){
  let clubs = JSON.parse(fs.readFileSync(__dirname+'/../data/clubs.json'));
  clubs[clubID].approved = true
  fs.writeFileSync(__dirname+'/../data/clubs.json', JSON.stringify(clubs));
}

exports.approveBudget = function(requestID){
  let budgets = JSON.parse(fs.readFileSync(__dirname+'/../data/receipts.json'));
  budgets[requestID].budget_approved = true;
  fs.writeFileSync(__dirname+'/../data/receipts.json', JSON.stringify(budgets));
}
