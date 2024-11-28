
import { app, newApp, startServer } from "./api";
import { DataStore } from "./utils/DataStore";
import { Logger } from "./log/Logger";
import { loadConfiguration } from "./utils/Config";

const start_time = (new Date().toLocaleTimeString()).replace(/:/g, '_');
console.log(start_time)
const logger = new Logger(`${start_time}.log`);
logger.info("Starting program..");

async function main() {
    let dataStore: DataStore;
    let api: app;
    const config = loadConfiguration(logger);
    try {
        dataStore = new DataStore(config.redis, config.mariadb, config.cache.timeout, config.cache.interval, logger);
        api = newApp(dataStore, logger);
        api.port = config.api.port;
        api.base_uri = config.api.base_uri;

        await startServer(api);
    } catch (e) { console.error('index.ts/main', e) };

    process.on('SIGINT', async () => {
        logger.info('SIGINT received: Closing the DataStore');
        exit(api);
    });

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received: Closing the DataStore');
        exit(api);
    });
}

async function exit(api: app) {
    await api.datastore.close();
process.exit(0);
}

main();