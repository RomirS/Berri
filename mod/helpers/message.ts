import moment  from 'moment';

export function formatMessage(room: string, sender: string, chat: any) {
    return {
        room,
        sender,
        chat,
        time: moment().format('L HH:mm:ss h:mm a'),
        status: 'unread'
    };
}