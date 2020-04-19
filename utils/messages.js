const moment = require('moment');

function formatMessage(room, sender, prof_pic, chat) {
    return {
        room,
        sender,
        prof_pic,
        chat,
        time: moment().format('h:mm a')
    };
}

module.exports = formatMessage;