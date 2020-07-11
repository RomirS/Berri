import { Firestore } from '../utils/firestoreConfig';
import { Request, Response } from 'express';
const db = Firestore();

export function readyVideo(req: Request, res: Response): Response {
    const session = req.session as Express.Session;
    session.isInitiator = req.body.isInitiator as boolean;
    session.signalTo = req.body.signalTo as string;
    return res.status(200).send({ result: 'redirect', url: '/videoChat' })
}

export function videoChat(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    res.render("videoChat", {
        title: "Berri Call",
        isInitiator: session.isInitiator,
        signalTo: session.signalTo
    })
}