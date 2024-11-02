import { genMap } from "./utils/genMap";
import { translateDifficultyMessage } from "./ENUM/DIFFICULTY";
import { v1 } from "../versions/v1";
import { DataStore } from "../utils/DataStore";
import { response } from "../api";
import { STATUS } from "../ENUM/STATUS";
import { translateMapSizeMessage } from "./ENUM/MAPSIZE";
import { hashSha256 } from "../utils/Hash";
import { translateJointPropertiesMessage } from "./ENUM/JOINTPROPERTIES";
import { translateJointTypeMessage } from "./ENUM/JOINTTYPE";
import { translateNoteTypeMessage } from "./ENUM/NODETYPE";

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
            const hashedPass = hashSha256(password);
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
            const map_size_int: number = translateMapSizeMessage(map_size);
            const map_size_number = map_size_int * max_player;
            this.logger.info(`map_size ${map_size}, map_size_int ${map_size_int}, total mapsize = ${map_size_number}`);
            const map = genMap({ map_size: map_size_number });
            await this.set({
                key: `room_${player_id}`, 
                value: { 
                    map: map, 
                    hash: hashedPass, 
                    stats: { 
                        map_size_number: map_size_number 
                    } 
                }, 
                bypassTimeOut: true 
            });

            return response(`room_${player_id}`);
        } catch (e) { this.logger.error('BlinedSeek/api.ts/createRoom', e) };
    }

    async getRoom(params: { player_id: string }) {
        try {
            const { player_id } = params;
            if (!player_id) {
                return response({ error: `Params player_id required` }, STATUS.BadRequest);
            }
            return await this.get({ key: `room_${player_id}` });
        } catch (e) { this.logger.error('BlinedSeek/api.ts/getRoom', e) };
    }

    async deleteRoom(params: { player_id: string, room_name: string, password: string }) {
        try {
            const { player_id, room_name, password } = params;
            if (!player_id || !params || !password) {
                return response({ error: `Params required` }, STATUS.BadRequest);
            }
            const rawroom = await this.getRoom({ player_id: player_id});
            let roomHash: string;
            if (rawroom && rawroom.body.hash) {
                roomHash = rawroom.body.hash as string;
                if (roomHash === hashSha256(password)) {
                    this.logger.info(`Password confirmed deleting room..`)
                    await this.delete({ key: `room_${player_id}` });
                    const rawrooms = await this.get({ key: "roomlist" })
                    let room_list: string[] = [];
                    if (rawrooms && rawrooms.body.value && Array.isArray(rawrooms.body.value)) {
                        room_list = rawrooms.body.value as string[];
                        const index = room_list.indexOf(player_id);
                        this.logger.info(`found room id ${player_id} at position ${index}`)
                        if (index !== -1) {
                            room_list.splice(index, 1);
                        }
                    }
                    await this.set({ key: "roomlist", value: room_list, bypassTimeOut: true });
                }
                else {
                    return response({error: `wrong password`}, STATUS.BadRequest);
                }
            }
            else {
                return response({error: `room not found`}, STATUS.BadRequest);
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
    
    async getEnum(params: { Enum: string, key: string }) {
        try {
            const { Enum, key } = params;
            if (!Enum || !key) {
                return response({ error: `Both 'key' and 'Enum' are required` }, STATUS.BadRequest);
            }
            let value;
            switch(Enum) {
                case "DIFFICULTY": {
                    value = translateDifficultyMessage(key);
                    if (value !== -1) {
                        return response({ key: key, Enum: Enum, value: value});
                    }
                    break;
                }
                case "JOINTPROPERTIES": {
                    value = translateJointPropertiesMessage(key);
                    if (value !== -1) {
                        return response({ key: key, Enum: Enum, value: value});
                    }
                    break;
                }
                case "JOINTTYPE": {
                    value = translateJointTypeMessage(key);
                    if (value !== -1) {
                        return response({ key: key, Enum: Enum, value: value});
                    }
                    break;
                }
                case "MAPSIZE": {
                    value = translateMapSizeMessage(key);
                    if (value !== -1) {
                        return response({ key: key, Enum: Enum, value: value});
                    }
                    break;
                }
                case "NODETYPE": {
                    value = translateNoteTypeMessage(key);
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