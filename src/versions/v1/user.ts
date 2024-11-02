import { response } from "../../api";
import { STATUS } from "../../ENUM/STATUS";
import { Client } from "../../utils/Client";
import { DataStore } from "../../utils/DataStore";
import { v1 } from "../v1";

export class userV1 extends v1 {
    constructor(dataStore: DataStore) {
        super(dataStore);
        this.dataStore = dataStore;
        this.logger = dataStore.logger;
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
        } catch (e) { this.logger.error('versions/v1/user.ts/get', e) };
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
        } catch (e) { this.logger.error('versions/v1/user.ts/set', e) };
    }

    async delete(params: { key: string }) {
        try {
            const { key } = params;
            await this.dataStore.delete(this.modifyKey(key));
            return response();
        } catch (e) { this.logger.error('versions/v1/user.ts/delete', e) };
    }

    private modifyKey(key: string): string {
        return "user." + key;
    }

    async getUser(params: { user_id: string }) {
        try {
            const { user_id } = params;
            if (!user_id) {
                return response({ error: `${user_id}' not found` }, STATUS.BadRequest);
            }
            return await this.get({ key: `${user_id}` });
        } catch (e) { this.logger.error('versions/v1/user.ts/getUser', e) };
    }

    async register(params: { user_id: string, user_name: string, password: string, confirm_password: string, ip: string }) {
        try {
            const { user_id, user_name, password, confirm_password, ip } = params;
            const res = await this.getUser({ user_id: user_id });
            if (res && res.status == 200) {
                return response({ error: `user ${user_id} already exists.` });
            }
            this.set({ key: `client_${user_id}`, value: new Client(user_id, user_name, ip, password) })
        } catch (e) { this.logger.error('versions/v1/user.ts/register', e) };
    }
}