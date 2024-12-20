import { CLIENTSTATUS } from "../ENUM/CLIENTSTATUS";
import { hashSha256 } from "./Hash";

export class Client {
    user_id: string;
    user_name: string;
    ip: string;
    last_seen: Date;
    first_seen: Date;
    status: CLIENTSTATUS;
    password: string;

    constructor(
        user_id: string,
        user_name: string,
        ip: string,
        password: string|undefined = undefined,
        first_seen: Date|undefined = undefined,
        last_seen: Date|undefined = undefined,
        status: CLIENTSTATUS = CLIENTSTATUS.Disconnected,
        hash: string|undefined = undefined
    ) {
        this.user_id = user_id;
        this.user_name = user_name;
        this.ip = ip;
        if (first_seen) {
            this.first_seen = first_seen;
        }
        else {
            this.first_seen = new Date();
        }
        if (last_seen) {
            this.last_seen = last_seen;
        }
        else {
            this.last_seen = new Date;
        }
        this.status = status;
        if (hash) {
            this.password = hash;
        }
        else {
            this.password = hashSha256(password as string);
        }
        
    }

    login(password: string) {
        if (hashSha256(password) == this.password) {
            this.status = CLIENTSTATUS.Connected;
            this.updateLastSeen();
        }
    }

    logout() {
        this.updateLastSeen();
        this.status = CLIENTSTATUS.Disconnected;
    }

    updateStatus(status: CLIENTSTATUS) {
        this.status = status;
    }

    updateLastSeen() {
        this.last_seen = new Date();
    }

    changePassword(oldPassword: string, newPassword: string) {
        if (hashSha256(oldPassword) == this.password) {
            this.password =  hashSha256(newPassword);
        }
    }

    getClientInfo() {
        return {
            user_id: this.user_id,
            user_name: this.user_name,
            ip: this.ip,
            first_seen: this.first_seen,
            last_seen: this.last_seen,
            status: this.status,
        };
    }
}