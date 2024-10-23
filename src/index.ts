import { app, newApp, startServer } from "./api";

function main() {
    let api: app = newApp();
    api.port = 80;
    api.base_uri = "/_api/";

    startServer(api);
}

main();