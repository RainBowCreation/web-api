import express, { Request, Response } from "express";
import { STATUS, translateStatusCode } from "./ENUM/STATUS";
import { DataStore } from "./utils/DataStore";
import { v0 } from "./versions/v0";
import { v1 } from "./versions/v1";
import { api as BlinedSeek } from "./BlinedSeek/api";

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
};

export function newApp(dataStore: DataStore): app {
    dataStore.set("ping", "pong", true);
    let expressApp: app = {
        name: name,
        server: express(),
        port: process.env.PORT || port,
        base_uri: base_uri,
        latest: latest,
        datastore: dataStore,
        versions: { v0: new v0(dataStore), v1: new v1(dataStore) , BlinedSeek: new BlinedSeek(dataStore)},
    };
    return expressApp;
}

export async function startServer(api: app) {
    try {
        print("Setting up json express..");
        api.server.use(express.json());

        api.datastore.set("name", api.name, true);
        api.datastore.set("port", api.port, true);
        api.datastore.set("base_uri", api.base_uri, true);
        api.datastore.set("latest", api.latest, true)
        api.datastore.set("versions", api.versions, true);

        print("Registering api method..");
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
                } catch (e) { console.error('api.ts/startServer/api.server.use.try', e) };
            } catch (e) { console.error('api.ts/startServer/api.server.use', e) };
        });
        /*
        api.server.all(
            `${api.base_uri}:version?/:method`,
            async (req: Request, res: Response) => {
                try {
                    const { version, method } = req.params;
                    const params = req.query;
                    let apiVersions: v0;

                    if (version && api.versions[version]) {
                        apiVersions = api.versions[version];
                    } else {
                        apiVersions = api.versions[api.latest];
                    }

                    try {
                        const apiInstance: any = apiVersions;
                        let result: response;
                        if (req.method === "GET" && apiInstance.get[method]) {
                            result = await apiInstance.get[method](params);
                        } else if (req.method === "POST" && apiInstance.post[method]) {
                            result = await apiInstance.post[method](params);
                        } else if (req.method === "PUT" && apiInstance.put[method]) {
                            result = await apiInstance.put[method](params);
                        } else if (req.method === "PATCH" && apiInstance.patch[method]) {
                            result = await apiInstance.patch[method](params);
                        } else if (req.method === "DELETE" && apiInstance.delete[method]) {
                            result = await apiInstance.delete[method](params);
                        } else if (req.method === "HEAD" && apiInstance.head[method]) {
                            result = await apiInstance.head[method](params);
                        } else if (req.method === "OPTIONS" && apiInstance.options[method]) {
                            result = await apiInstance.options[method](params);
                        } else {
                            return res.status(status.NotFound).send({ body: { error: translateStatusCode(status.NotFound) } });
                        }
                        return res.status(result.status).send({ body: result.body });
                    } catch (error) {
                        return res.status(status.InternalServerError).send({ body: { error: translateStatusCode(status.InternalServerError) } });
                    }
                } catch (e) { console.error('api.ts/startServer/api.server.all',e) };
            }
        );
        */

        print("Starting server..");
        api.server.listen(api.port, () => {
            print(
                `Server ${api.name} running at http://localhost:${api.port}${api.base_uri}`
            );
        });
    } catch (e) { console.error('api.ts/startServer', e) };
}

export function now(): number {
    return Date.now();
}

export function print(message: string | number | object) {
    console.log(message);
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
