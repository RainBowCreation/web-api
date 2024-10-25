import { response } from "../api";
import { STATUS, translateStatusMessage } from "../ENUM/STATUS";
import { DataStore } from "../utils/DataStore";
import { v0 } from "./v0";


export class v1 extends v0 {
  constructor(dataStore: DataStore) {
    super(dataStore);
    this.dataStore = dataStore;
    this.logger = dataStore.logger;
  }

  async getVersion() {
    try {
      return response("v1");
    } catch (e) { this.logger.error('versions/v1.ts/getVersion', e) };
  }

  async getEnum(params: { Enum: string, key: string }) {
        try {
            const { Enum, key } = params;
            let value;
            switch(Enum) {
                case "STATUS": {
                    value = translateStatusMessage(key);
                    if (value !== -1) {
                        return response({ key: key, Enum: Enum, value: value});
                    }
                    break;
                }
                
            }
            return response({ error: `${key}' not found` }, STATUS.BadRequest);
        }
        catch (e) { this.logger.error('BlinedSeek/api.ts/getConfig', e) };
    }
}