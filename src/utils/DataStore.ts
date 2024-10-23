export class DataStore {
    private store: { [key: string]: any } = {};

    contain(key: string) {
        return this.store[key] !== undefined;
    }

    get(key: string) {
        return this.contain(key) ? this.store[key] : null;
    }

    set(key: string, value: any) {
        this.store[key] = value;
    }

    delete(key: string) {
        if (this.contain(key)) {
            delete this.store[key];
            return true;
        }
        return false;
    }
}
