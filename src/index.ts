import { app, newApp, startServer } from "./api";
import { DataStore } from "./utils/DataStore";
import * as config from "../config.json";

async function main() {
    let dataStore: DataStore;
    let api: app;
    try {
        dataStore = new DataStore(config.redis, config.mariadb, config.cache.timeout, config.cache.interval);
        api = newApp(dataStore);
        api.port = config.api.port;
        api.base_uri = config.api.base_uri;

        await startServer(api);
    } catch (e) { console.error('index.ts/main', e) };

    process.on('SIGINT', async () => {
        console.log('SIGINT received: Closing the DataStore');
        exit(api);
    });

    process.on('SIGTERM', async () => {
        console.log('SIGTERM received: Closing the DataStore');
        exit(api);
    });
}

async function exit(api: app) {
    await api.datastore.close();
    process.exit(0);
}

main();