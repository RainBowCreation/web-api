import { app, newApp, startServer } from "./api";

function main() {
    let api: app = newApp();
    api.port = 80;
    api.base_uri = "/_api/";
    api.latest = "v1";
    api.versions = {'v1': new v1()}

    startServer(api);
}

main();