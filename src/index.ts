import { app, newApp, startServer } from "./api";
import { DataStore } from "./utils/DataStore";

function main() {
    const dataStore = new DataStore();
    const api: app = newApp(dataStore);
    api.port = 80;
    api.base_uri = "/_api/";

    startServer(api);
}

main();