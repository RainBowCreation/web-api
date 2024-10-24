import { response } from "../api";
import { DataStore } from "../utils/DataStore";
import { v0 } from "./v0";


export class v1 extends v0 {
  constructor(dataStore: DataStore) {
    super(dataStore);
    this.dataStore = dataStore;
  }

  async getVersion() {
    try {
      return response("v1");
    } catch (e) { console.error('versions/v1.ts/getVersion', e) };
  }
}