import { app, newApp, startServer } from "./api";
import { v0 } from "./versions/v0";
import { v1 } from "./versions/v1";

function main() {
    let api: app = newApp();
    api.port = 80;
    api.base_uri = "/_api/";
    api.latest = "v1";
    api.versions = ["v0", "v1"];

    v0(api);
    v1(api);

    startServer(api);
}

main();
