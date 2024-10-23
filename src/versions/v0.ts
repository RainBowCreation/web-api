import { response } from "../api";
import { DataStore } from "../utils/datastore";
import { HttpStatusCodes as status, translateStatusCode } from "../utils/StatusCode";

export class v0 {
  protected dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
    this.dataStore.set("version", "v0");
  }

  get = {
    get: (params: { key: string }) => {
      const { key } = params;
      if (!key) {
        return response({ error: `Key is required` }, status.BadRequest);
      }
      if (this.dataStore.contain(key)) {
        return response({ key: key, value: this.dataStore.get(key) });
      }
      return response({ error: `${key}' not found` }, status.BadRequest);
    },
    ping() {
      return this.get({key: "ping"});
    },
    getVersion() {
      return this.get({key: "version"});
    },
  };

  post = {
    set: (params: { key: string; value: any }) => {
      const { key, value } = params;
      if (!key || value === undefined) {
        return response({ error: `Both 'key' and 'value' are required` }, status.BadRequest);
      }
      this.dataStore.set(key, value);
      return response();
    },
  };
}