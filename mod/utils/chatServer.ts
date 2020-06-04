import express from 'express';
import session from 'express-session';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { createServer, Server } from 'http';

export class ChatServer {
    public static readonly PORT:number = 8000;
    private app!: express.Application;
    private port!: string | number;
    private server!: Server;

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
        this.app
        .set('views', path.resolve(__dirname, '../views'))
        .set('view engine', 'pug')
        .use(express.static(path.resolve(__dirname, '../public')))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(session({
            secret: 'secret',
            resave: true,
            saveUninitialized: true
        }));  
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}                              