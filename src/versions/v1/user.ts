import { response } from "../../api";
import { CLIENTSTATUS } from "../../ENUM/CLIENTSTATUS";
import { STATUS } from "../../ENUM/STATUS";
import { Client } from "../../utils/Client";
import { DataStore } from "../../utils/DataStore";
import { hashSha256 } from "../../utils/Hash";
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
            return await this.get({ key: `client_${user_id}` });
        } catch (e) { this.logger.error('versions/v1/user.ts/getUser', e) };
    }

    async register(params: { user_id: string, user_name: string, password: string, confirm_password: string, ip: string}) {
        try {
            const { user_id, user_name, password, confirm_password, ip } = params;
            if (!user_name || !params || !password) {
                return response({ error: `Params required` }, STATUS.BadRequest);
            }
            if (confirm_password) {
                if (password != confirm_password) {
                    return response({error: `Password not matched`}, STATUS.BadRequest);
                }
            }
            const res = await this.getUser({ user_id: user_id });
            if (res && res.status == STATUS.OK) {
                return response({ error: `user ${user_id} already exists.` });
            }
            const rawusers = await this.get({ key: "userlist" })
            let user_list: string[] = [];
            this.logger.info(rawusers)
            if (rawusers && rawusers.status==STATUS.OK && rawusers.body.value && Array.isArray(rawusers.body.value)) {
                this.logger.info ("passed")
                user_list = rawusers.body.value as string[];
            }
            this.logger.info(user_list)
            user_list.push(user_id)
            this.logger.info(user_list)
            await this.set({ key: "userlist", value: user_list, bypassTimeOut: true })
            await this.set({ key: `client_${user_id}`, value: new Client(user_id, user_name, ip, password), bypassTimeOut: true })
            return response();
        } catch (e) { this.logger.error('versions/v1/user.ts/register', e) };
    }

    async login(params: { user_id: string, user_name: string, password: string}) {
        try {
            const { user_id, user_name, password } = params;
            if (!user_name || !params || !password) {
                return response({ error: `Params required` }, STATUS.BadRequest);
            }
            const res = await this.getUser({ user_id: user_id });
            if (res && res.status != STATUS.OK) {
                return response({ error: `user ${user_id} not found.` });
            }
            const value = res?.body.value;
            if (value.password == hashSha256(password)) {
                this.logger.info(`logging in..`);
                await this.set({ key: `client_${user_id}`, value: new Client(value.user_id, value.user_name, value.ip, value.password, value.first_seen, new Date(), CLIENTSTATUS.Connected, value.password), bypassTimeOut: true })
                return response();
            }
            return response({error: `Password not matched`}, STATUS.BadRequest);
        } catch (e) { this.logger.error('versions/v1/user.ts/login', e) };
    }

    async logout(params: { user_id: string, user_name: string, ip: string}) {
        try {
            const { user_id, user_name, ip } = params;
            if (!user_name || !params || !ip) {
                return response({ error: `Params required` }, STATUS.BadRequest);
            }
            const res = await this.getUser({ user_id: user_id });
            if (res && res.status != STATUS.OK) {
                return response({ error: `user ${user_id} not found.` });
            }
            const value = res?.body.value;
            if (value.status == CLIENTSTATUS.Disconnected) {
                return response({error: `user not logged in.`}, STATUS.BadGateway);
            }
            if (value.ip == ip) {
                this.logger.info(`logging out..`);
                await this.set({ key: `client_${user_id}`, value: new Client(value.user_id, value.user_name, value.ip, value.password, value.first_seen, new Date(), CLIENTSTATUS.Disconnected), bypassTimeOut: true })
                return response();
            }
            return response({error: `You don't have permission to do this.`}, STATUS.BadRequest);
        } catch (e) { this.logger.error('versions/v1/user.ts/logout', e) };
    }
}