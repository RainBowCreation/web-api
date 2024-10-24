import { response } from "../api";
import { DataStore } from "../utils/DataStore";
import { STATUS } from "../ENUM/STATUS";
import { Logger } from "../log/Logger";

export class v0 {
  protected dataStore: DataStore;
  protected logger: Logger;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
    this.logger = dataStore.logger;
  }

  async get(params: { key: string }) {
    try {
      const { key } = params;
      this.logger.info(key)
      if (!key) {
        return response({ error: `Key is required` }, STATUS.BadRequest);
      }
      if (await this.dataStore.contain(key, true)) {
        return response({ key: key, value: await this.dataStore.get(key) });
      }
      return response({ error: `${key}' not found` }, STATUS.BadRequest);
    } catch (e) { this.logger.error('versions/v0.ts/get', e) };
  }
  async ping() {
    try {
      return this.get({ key: "ping" });
    } catch (e) { this.logger.error('versions/v0.ts/ping', e) };
  }
  async getVersion() {
    try {
      return response("v0");
    } catch (e) { this.logger.error('versions/v0.ts/getVersion', e) };
  }

  async set(params: { key: string, value: any, bypassTimeOut?: boolean, overrideTimeOut?: number }) {
    try {
      const { key, value, bypassTimeOut, overrideTimeOut } = params;
      if (!key || value === undefined) {
        return response({ error: `Both 'key' and 'value' are required` }, STATUS.BadRequest);
      }
      let newBypassTimeOut = bypassTimeOut;
      if (!bypassTimeOut) {
        newBypassTimeOut = false;
      }
      let newOverrideTimeOut = overrideTimeOut;
      if (!overrideTimeOut) {
        newOverrideTimeOut = -1;
      }
      this.dataStore.set(key, value, newBypassTimeOut, newOverrideTimeOut);
      return response();
    } catch (e) { this.logger.error('versions/v0.ts/set', e) };
  }

  async delete(params: { key: string }) {
    try {
      const { key } = params;
      await this.dataStore.delete(key);
      return response();
    } catch (e) { this.logger.error('versions/v0.ts/delete', e) };
  }
}