import express from 'express';
import session from 'express-session';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { createServer, Server } from 'http';
import socketIo from 'socket.io';
import { Firestore } from '../utils/firestoreConfig';
const db = Firestore();
import { formatMessage } from '../helpers/message';


export class ChatServer {
    public static readonly PORT:number = 8000;
    private app!: express.Application;
    private port!: string | number;
    private server!: Server;
    private io!: socketIo.Server;

    constructor() {
        this.createApp();
        this.createServer();
        this.config();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
        this.app
        .set('views', path.resolve(__dirname, '../views'))
        .set('view engine', 'pug')
        .use(express.static('public'))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(session({
            secret: 'secret',
            resave: true,
            saveUninitialized: true
        }));  
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
        process.on('uncaughtException', (err) => { 
            console.log(err);
            this.server.close();
        })
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    public getIo(): socketIo.Server {
        return this.io;
    }
}                              