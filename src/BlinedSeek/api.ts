import { genMap, ConfigurableParams } from "./utils/genMap";
import { DIFFICULTY } from "./ENUM/DIFFICULTY";
import { v1 } from "../versions/v1";
import { DataStore } from "../utils/DataStore";
import * as config from "./config.json";
import { response } from "../api";

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
        } catch (e) { console.error('BlinedSeek/api.ts/createRoom', e) };
    }
}