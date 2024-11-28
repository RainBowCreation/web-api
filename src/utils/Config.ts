import fs from "fs";
import * as path from "path";
import * as config from "../config.json";
import { Logger } from "../log/Logger";

export function loadConfiguration(logger: Logger) {
    const defaultConfig = config;
    const myConfigPath = path.resolve(__dirname, "../myconfig.json");

    let finalConfig = { ...defaultConfig };

    try {
        if (fs.existsSync(myConfigPath)) {
            const myConfig = JSON.parse(fs.readFileSync(myConfigPath, "utf8"));
            finalConfig = { ...defaultConfig, ...myConfig };
            logger.info("Loaded myconfig.json")
        }
        else {
            logger.info("Loaded default configuration. If you want to use your custom config, copy 'config.json' to 'myconfig.json'")
        }
    } catch (error) {
        logger.error("Error loading configuration:", error);
    }
    return finalConfig;
}