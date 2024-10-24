import { response } from "../api";
import { DataStore } from "../utils/DataStore";
import { v0 } from "./v0";
export class v1 extends v0 {
  constructor(dataStore: DataStore) {
    super(dataStore);
    this.dataStore = dataStore;
    this.dataStore.set("version", "v1", true);
  }
  post = {
    set: async (params: { key: string; value: any }) => {
      try {
        const { key, value } = params;
        const newValue = `v1_${value}`;
        this.dataStore.set(key, newValue);
        return response();
      } catch (e) { console.error('versions/v1.ts/set',e) };
    },
  };
}