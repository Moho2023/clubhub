const dateTime = require("date-and-time")
const now = new Date("2023-04-14T19:03:00" + ".070Z");
console.log(now);
console.log(dateTime.format(now, 'ddd, MMMM DD YYYY at hh:mm A'));
const current = new Date()
console.log(current)
console.log(dateTime.format(current, 'ddd MMMM DD YYYY at hh:mm A'))
        // => '11:14 PM GMT-0800'
