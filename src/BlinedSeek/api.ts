import { genMap, ConfigurableParams } from "./utils/genMap";
import { DIFFICULTY } from "./ENUM/DIFFICULTY";
import { v1 } from "../versions/v1";
import { DataStore } from "../utils/DataStore";
import * as config from "./config.json";
import { response } from "../api";
import { STATUS } from "../ENUM/STATUS";
import { MAPSIZE, translateMapSizeCode, translateMapSizeMessage } from "./ENUM/MAPSIZE";
import { hashSha256 } from "../utils/Hash";

export class api extends v1 {
    constructor(dataStore: DataStore) {
        super(dataStore);
        this.dataStore = dataStore;
        this.logger = dataStore.logger;
    }

    async getVersion() {
        try {
            return response("BlinedSeek v0.0.1");
        } catch (e) { this.logger.error('BlinedSeek/api.ts/getVersion', e) };
    }

    async createRoom(params: { player_id: string, room_name: string, password: string, max_player: number, difficulty: string, start_coin: number, map_size: string }) {
        try {
            const { player_id, room_name, password, max_player, difficulty, start_coin, map_size } = params;
            if (!player_id || !params || !password) {
                return response({ error: `Params required` }, STATUS.BadRequest);
            }
            const hasedPass = hashSha256(password);
            const rawrooms = await this.get({ key: "roomlist" })
            let room_list: string[] = [];
            this.logger.info(rawrooms)
            if (rawrooms && rawrooms.status==STATUS.OK && rawrooms.body.value && Array.isArray(rawrooms.body.value)) {
                this.logger.info ("passed")
                room_list = rawrooms.body.value as string[];
            }
            this.logger.info(room_list)
            room_list.push(player_id)
            this.logger.info(room_list)
            await this.set({ key: "roomlist", value: room_list, bypassTimeOut: true })
            const map = genMap({ map_size: translateMapSizeMessage(map_size) * max_player })
            await this.set({ key: `room_${player_id}`, value: { map: map, hash: hasedPass, stats: { map_size_number: translateMapSizeMessage(map_size) * max_player } }, overrideTimeOut: 500 });

            return response(`room_${player_id}`);
        } catch (e) { this.logger.error('BlinedSeek/api.ts/createRoom', e) };
    }

    async deleteRoom(params: { player_id: string, room_name: string, password: string; }) {
        try {
            const { player_id, room_name, password } = params;
            if (!player_id || !params || !password) {
                return response({ error: `Params required` }, STATUS.BadRequest);
            }
            const rawroom = await this.get({ key: `room_${player_id}` })
            let roomHash: string;
            if (rawroom && rawroom.body.hash) {
                roomHash = rawroom.body.hash as string;
                if (roomHash === hashSha256(password)) {
                    await this.delete({ key: `room_${player_id}` });
                    const rawrooms = await this.get({ key: "roomlist" })
                    let room_list: string[] = [];
                    if (rawrooms && rawrooms.body.value && Array.isArray(rawrooms.body.value)) {
                        room_list = rawrooms.body.value as string[];
                        const index = room_list.indexOf(player_id);
                        if (index !== -1) {
                            room_list.splice(index, 1);
                        }
                    }
                    await this.set({ key: "roomlist", value: room_list, bypassTimeOut: true });
                }
            }
            return response();
        } catch (e) { this.logger.error('BlinedSeek/api.ts/deleteRoom', e) };
    }

    async get(params: { key: string }) {
        try {
            const { key } = params;
            if (!key) {
                return response({ error: `Key is required` }, STATUS.BadRequest);
            }
            let newKey = this.modifyKey(key);
            if (await this.dataStore.contain(newKey, true)) {
                return response({ key: key, value: await this.dataStore.get(newKey) });
            }
            return response({ error: `${key}' not found` }, STATUS.BadRequest);
        } catch (e) { this.logger.error('BlinedSeek/api.ts/get', e) };
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
            this.dataStore.set(this.modifyKey(key), value, newBypassTimeOut, newOverrideTimeOut);
            return response();
        } catch (e) { this.logger.error('BlinedSeek/api.ts/set', e) };
    }

    async delete(params: { key: string }) {
        try {
            const { key } = params;
            await this.dataStore.delete(this.modifyKey(key));
            return response();
        } catch (e) { this.logger.error('BlinedSeek/api.ts/delete', e) };
    }

    private modifyKey(key: string): string {
        return "BlinedSeek." + key;
    }
}