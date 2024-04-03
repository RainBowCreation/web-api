import { Request, Response} from "express";

import { app } from "../api";


export function v0(api: app) {
    const uri: string = `${api.base_uri}`;
    
    ping(api, uri);
    getVersion(api, uri);
    getVersions(api, uri);
}

function getVersion(api: app, uri: string) {
    const version = {
        version: api.latest
    }

    api.server.get(`${uri}getVersion`, (req: Request, res: Response) => {
        res.status(200).json(version);
    });

    api.server.get(`${uri}getLastest`, (req: Request, res: Response) => {
        res.status(200).json(version);
    });
}

function getVersions(api: app, uri: string) {
    api.server.get(`${uri}getVersions`, (req: Request, res: Response) => {
        res.status(200).json(api.versions);
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