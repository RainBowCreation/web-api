import express from "express";

export type app = {
    server: any,
    port: string | number,
    base_uri: string,
    latest: string,
    versions: string[]
}

export function newApp(): app {
    let expressapp: app = {
        server: express(),
        port: process.env.PORT || 3000,
        base_uri: "/",
        latest: "1.0.0",
        versions: ["1.0.0"],
    }
    return expressapp;
}

export function startServer(api: app) {
    api.server.listen(api.port, () => {
        print(`Server running at http://localhost:${api.port}`);
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