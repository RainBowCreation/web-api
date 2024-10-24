import { app, newApp, startServer } from "./api";
import { DataStore } from "./utils/DataStore";
import * as config from "../config.json";

async function main() {
    try {
        const dataStore = new DataStore(config.redis, config.mariadb);
        const api: app = newApp(dataStore);
        api.port = 80;
        api.base_uri = "/_api/";

        await startServer(api);
    } catch (e) { console.error('main') };
}

main();