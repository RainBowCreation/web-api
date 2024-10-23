import { response } from "../api";

export class v0 {
  private store: { [key: string]: any } = {};

  get = {
    ping() {
      return response('pong');
    },
    get: (params: { key: string }) => {
      const { key } = params;
      if (!key) {
        return response({error: `Key is required`});
      }
      if (this.store[key] !== undefined) {
        return response({key:key, value: this.store[key]});
      }
      return response({error: `${key}' not found`});
    },
  };

  post = {
    set: (params: { key: string; value: any }) => {
      const { key, value } = params;
      if (!key || value === undefined) {
        return response({error: `Both 'key' and 'value' are required`});
      }
      this.store[key] = value;
      return response({key:key, value: value});
    },
  };
}