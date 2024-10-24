
import { app, newApp, startServer } from "./api";
import { DataStore } from "./utils/DataStore";
import { genMap } from "./BlinedSeek/utils/genMap";
import * as config from "./myconfig.json";
import { Logger } from "./log/Logger";

const start_time = (new Date().toLocaleTimeString()).replace(/:/g, '_');
console.log(start_time)
const logger = new Logger(`${start_time}.log`);
logger.info("Starting program..");

async function main() {
    let dataStore: DataStore;
    let api: app;
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

async function test() {
    const configuredMap = genMap({ map_size: 20, a: 3, b: 1, c: 1, d: 1, e: 1, f: 2, g: 1 });
    console.log(configuredMap);

    // Example usage for random parameters:
    const randomMap = genMap({ map_size: 20 });
    console.log(randomMap);

    const customMap = genMap({ map_size: 20, a: 3, c: 1, g: 1 });
    console.log(customMap)
}

async function exit(api: app) {
    await api.datastore.close();
process.exit(0);
}

main();