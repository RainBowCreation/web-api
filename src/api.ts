import express, { Request, Response } from "express";
import { STATUS, translateStatusCode } from "./ENUM/STATUS";
import { DataStore } from "./utils/DataStore";
import { v0 } from "./versions/v0";
import { v1 } from "./versions/v1";
import { api, api as BlinedSeek } from "./BlinedSeek/api";
import { Logger } from "./log/Logger";
import { userV1 } from "./versions/v1/user";

const port = 3300;
const name = "RainBowCreation";
const base_uri = "/";
const latest = "v1";
const versions = ["v0", "v1"];

export type app = {
    name: string;
    server: any;
    port: string | number;
    base_uri: string;
    latest: string;
    datastore: DataStore;
    versions: { [key: string]: v0 };
    logger: Logger;
};

export function newApp(dataStore: DataStore, logger: Logger): app {
    dataStore.set("ping", "pong", true);
    let expressApp: app = {
        name: name,
        server: express(),
        port: process.env.PORT || port,
        base_uri: base_uri,
        latest: latest,
        datastore: dataStore,
        versions: { 
            v0: new v0(dataStore), 
            v1: new v1(dataStore),
            "v1/user": new userV1(dataStore),
            BlinedSeek: new BlinedSeek(dataStore)},
        logger: logger
    };
    return expressApp;
}

export async function startServer(api: app) {
    try {
        api.logger.info("Setting up json express..");
        api.server.use(express.json());

        api.datastore.set("name", api.name, true);
        api.datastore.set("port", api.port, true);
        api.datastore.set("base_uri", api.base_uri, true);
        api.datastore.set("latest", api.latest, true)

        api.logger.info("Registering api method..");
        api.server.use('/_api/:version?/:method', async (req: Request, res: Response) => {
            try {
                const { version, method } = req.params;
                const params = req.query;
                let apiInstance: v0;

                // Determine which API version to use
                if (version && api.versions[version]) {
                    apiInstance = api.versions[version];
                } else {
                    // Fallback to latest version if no version is provided
                    apiInstance = api.versions[api.latest];
                }

                // Call the specified method if it exists
                try {
                    const Api: any = apiInstance;
                    if (Api[method]) {
                        const result: response = await Api[method](params);
                        res.status(result.status).send({ body: result.body });
                    } else {
                        res.status(STATUS.NotFound).send(translateStatusCode(STATUS.NotFound));
                    }
                } catch (e) { api.logger.error('server.use.try', e) };
            } catch (e) { api.logger.error('server.use', e) };
        });

        api.logger.info("Starting server..");
        api.server.listen(api.port, () => {
            api.logger.info(`Server ${api.name} running at http://localhost:${api.port}${api.base_uri}`);
        });
    } catch (e) { api.logger.error(``, e) };
}

export function now(): number {
    return Date.now();
}

export type response = {
    status: number;
    body: any;
};

export function response(
    body: any = undefined,
    status: STATUS | number = 200
): response {
    let r: response = {
        status: status,
        body: body,
    };
    return r;
}
