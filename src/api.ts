import express, { Request, Response } from "express";
import {HttpStatusCodes as status, translateStatusCode} from "./utils/StatusCode";
import { DataStore } from "./utils/datastore";
import { v0 } from "./versions/v0";
import { v1 } from "./versions/v1";

const port = 3300;
const name = "rbc";
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
    dataStore.set("ping", "pong");
    dataStore.set("name", name);
    dataStore.set("port", port);
    dataStore.set("base_uri", base_uri);
    dataStore.set("versions", versions);
    let expressApp: app = {
        name: name,
        server: express(),
        port: process.env.PORT || port,
        base_uri: base_uri,
        latest: latest,
        datastore: dataStore,
        versions: { v0: new v0(dataStore), v1: new v1(dataStore) },
    };
    return expressApp;
}

export function startServer(api: app) {
    print("Setting up json express..");
    api.server.use(express.json());

    print("Registering api method..");
    api.server.all(
        `${api.base_uri}:version?/:method`,
        (req: Request, res: Response) => {
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
                    result = apiInstance.get[method](params);
                } else if (req.method === "POST" && apiInstance.post[method]) {
                    result = apiInstance.post[method](params);
                } else if (req.method === "PUT" && apiInstance.put[method]) {
                    result = apiInstance.put[method](params);
                } else if (req.method === "PATCH" && apiInstance.patch[method]) {
                    result = apiInstance.patch[method](params);
                } else if (req.method === "DELETE" && apiInstance.delete[method]) {
                    result = apiInstance.delete[method](params);
                } else if (req.method === "HEAD" && apiInstance.head[method]) {
                    result = apiInstance.head[method](params);
                } else if (req.method === "OPTIONS" && apiInstance.options[method]) {
                    result = apiInstance.options[method](params);
                } else {
                    return res.status(status.NotFound).send({ body: { error: translateStatusCode(status.NotFound) }});
                }
                return res.status(result.status).send({ body: result.body });
            } catch (error) {
                return res.status(status.InternalServerError).send({ body: { error: translateStatusCode(status.InternalServerError) } });
            }
        }
    );

    print("Starting server..");
    api.server.listen(api.port, () => {
        print(
            `Server ${api.name} running at http://localhost:${api.port}${api.base_uri}`
        );
    });
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
    status: status | number = 200
): response {
    let r: response = {
        status: status,
        body: body,
    };
    return r;
}
