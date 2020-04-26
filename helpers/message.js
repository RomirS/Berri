const moment = require('moment');

module.exports = {
    formatMessage: function(room, sender, prof_pic, chat) {
        return {
            room,
            sender,
            prof_pic,
            chat,
            time: moment().format('h:mm a')
        };
    }
}
