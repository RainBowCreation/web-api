import { Request, Response} from "express";

import { print, app } from "../api";


export function v1(api: app) {
    const uri: string = `${api.base_uri}v1/`;
    
    ping(api, uri);
    getIP(api, uri);
}

function getIP(api: app, uri: string) {
    api.server.get(`${uri}getIP`, (req: Request, res: Response) => {
        const ips: string | string[] | undefined = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (ips === undefined)
            res.status(404).json('Error undefined ip');
        else {
            const ip = {
                ip: ips
            }
            res.status(200).json(ip);
        }
    });
}

function getVersion(api: app, uri: string) {
    api.server.get(`${uri}getVersion`, (req: Request, res: Response) => {
        const version = {
            version: "v1"
        }
        res.status(200).json(version);
    });
}

function ping(api: app, uri: string) {
    api.server.get(uri, (req: Request, res: Response) => {
        res.status(200).json("Pong");
    });

    api.server.get(`${uri}ping`, (req: Request, res: Response) => {
        res.status(200).json("Pong");
    });
}
