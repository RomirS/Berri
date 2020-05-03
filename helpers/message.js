const moment = require('moment');

module.exports = {
    formatMessage: function(room, sender, chat) {
        return {
            room,
            sender,
            chat,
            time: moment().format('L HH:mm:ss h:mm a'),
            status: 'unread'
        };
    }
}