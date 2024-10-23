import express, { Request, Response } from 'express';
import { v0 } from './versions/v0';
import { v1 } from './versions/v1';

export type app = {
    name: string,
    server: any,
    port: string | number,
    base_uri: string,
    latest: string,
    versions: { [key: string]: v0 }
}

export function newApp(): app{
    let expressapp: app = {
        name: '',
        server: express(),
        port: process.env.PORT || 3300,
        base_uri: '/',
        latest: 'v1',
        versions: {'v0': new v0(), 'v1': new v1()},
    }
    return expressapp;
}
/*
export function newApp(name: string = '', port: string | number = 3300, base_uri: string = '/'): app {
    let expressapp: app = {
        name: name,
        server: express(),
        port: process.env.PORT || port,
        base_uri: base_uri,
        latest: "1.0.0",
        versions: {'v1': new v1()},
    }
    return expressapp;
}
*/
export function startServer(api: app) {
    api.server.use(`${api.base_uri}:version?/:method`, (req: Request, res: Response) => {
        const { version, method } = req.params;
        let apiVersions: v0;
    
        if (version && api.versions[version]) {
            apiVersions = api.versions[version];
        } else {
            apiVersions = api.versions[api.latest];
        }
    
        if (typeof (apiVersions as any)[method] === 'function') {
            const result = (apiVersions as any)[method]();
            res.send({body: result});
        } else {
            res.status(404).send({body: 'Method not found'});
        }
    });
    api.server.listen(api.port, () => {
        print(`Server ${api.name} running at http://localhost:${api.port}/${api.base_uri}`);
    });
}

export function now(): number {
    return Date.now();
}

export function print(message: string | number | object) {
    console.log(message);
}

export type response = {
    status: number,
    body: any
}