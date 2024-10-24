import { genMap, ConfigurableParams } from "./utils/genMap";
import { DIFFICULTY } from "./ENUM/DIFFICULTY";
import { v1 } from "../versions/v1";
import { DataStore } from "../utils/DataStore";
import * as config from "./config.json";
import { response } from "../api";
import { STATUS } from "../ENUM/STATUS";
import { MAPSIZE, translateMapSizeCode, translateMapSizeMessage } from "./ENUM/MAPSIZE";

export class api extends v1 {
    constructor(dataStore: DataStore) {
        super(dataStore);
        this.dataStore = dataStore;
    }

    async getVersion() {
        try {
            return response("BlinedSeek v0.0.1");
        } catch (e) { console.error('BlinedSeek/api.ts/getVersion', e) };
    }

    async createRoom(params: { player_id: string, room_name: string, max_player: number, difficulty: string, start_coin: number, map_size: string }) {
        try {
            const { player_id, room_name, max_player, difficulty, start_coin, map_size } = params;
            if (!player_id || !params) {
                return response({error: `Params required`}, STATUS.BadRequest);
            }
            const map = genMap({ map_size: translateMapSizeMessage(map_size) * max_player })
            await this.set({key:`room_${player_id}`, value: {map: map, config: params}});
            return response(map);
        } catch (e) { console.error('BlinedSeek/api.ts/createRoom', e) };
    }

    async get(params: { key: string }) {
        try {
            const { key } = params;
            console.log(key)
            if (!key) {
                return response({ error: `Key is required` }, STATUS.BadRequest);
            }
            let newKey = this.modifyKey(key);
            if (await this.dataStore.contain(newKey, true)) {
                return response({ key: key, value: await this.dataStore.get(newKey) });
            }
            return response({ error: `${key}' not found` }, STATUS.BadRequest);
        } catch (e) { console.error('BlinedSeek/api.ts/get', e) };
    }

    async set(params: { key: string, value: any }) {
        try {
            const { key, value } = params;
            if (!key || value === undefined) {
                return response({ error: `Both 'key' and 'value' are required` }, STATUS.BadRequest);
            }
            this.dataStore.set(this.modifyKey(key), value);
            return response();
        } catch (e) { console.error('BlinedSeek/api.ts/set', e) };
    }

    async delete(params: { key: string }) {
        try {
            const { key } = params;
            await this.dataStore.delete(this.modifyKey(key));
            return response();
        } catch (e) { console.error('BlinedSeek/api.ts/delete', e) };
    }

    private modifyKey(key: string): string {
        return "BlinedSeek." + key;
    }
}