import { response } from "../api";
import { DataStore } from "../utils/DataStore";
import { HttpStatusCodes as status } from "../utils/StatusCode";

export class v0 {
  protected dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
    this.dataStore.set("version", "v0", true);
  }

  get = {
    get: async (params: { key: string }) => {
      try {
        const { key } = params;
        if (!key) {
          return response({ error: `Key is required` }, status.BadRequest);
        }
        if (await this.dataStore.contain(key, true)) {
          return response({ key: key, value: await this.dataStore.get(key) });
        }
        return response({ error: `${key}' not found` }, status.BadRequest);
      } catch (e) { console.error('versions/v0.ts/get',e) };
    },
    async ping() {
      try {
        return this.get({ key: "ping" });
      } catch (e) { console.error('versions/v0.ts/ping',e) };
    },
    async getVersion() {
      try {
        return this.get({ key: "version" });
      } catch (e) { console.error('versions/v0.ts/getVersion',e) };
    },
  };

  post = {
    set: async (params: { key: string; value: any }) => {
      try {
        const { key, value } = params;
        if (!key || value === undefined) {
          return response({ error: `Both 'key' and 'value' are required` }, status.BadRequest);
        }
        this.dataStore.set(key, value);
        return response();
      } catch (e) { console.error('versions/v0.ts/set',e) };
    },
  };

  delete = {
    delete: async (params: { key: string }) => {
      try {
        const { key } = params;
        await this.dataStore.delete(key);
        return response();
      } catch (e) { console.error('versions/v0.ts/delete',e) };
    }
  }
}