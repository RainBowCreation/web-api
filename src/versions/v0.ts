import { error } from "console";
import { response } from "../api";
import { DataStore } from "../utils/DataStore";
import { STATUS } from "../ENUM/STATUS";

export class v0 {
  protected dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  async get(params: { key: string }) {
    try {
      const { key } = params;
      console.log(key)
      if (!key) {
        return response({ error: `Key is required` }, STATUS.BadRequest);
      }
      if (await this.dataStore.contain(key, true)) {
        return response({ key: key, value: await this.dataStore.get(key) });
      }
      return response({ error: `${key}' not found` }, STATUS.BadRequest);
    } catch (e) { console.error('versions/v0.ts/get', e) };
  }
  async ping() {
    try {
      return this.get({ key: "ping" });
    } catch (e) { console.error('versions/v0.ts/ping', e) };
  }
  async getVersion() {
    try {
      return response("v0");
    } catch (e) { console.error('versions/v0.ts/getVersion', e) };
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
    } catch (e) { console.error('versions/v0.ts/set', e) };
  }

  async delete(params: { key: string }) {
    try {
      const { key } = params;
      await this.dataStore.delete(key);
      return response();
    } catch (e) { console.error('versions/v0.ts/delete', e) };
  }
}