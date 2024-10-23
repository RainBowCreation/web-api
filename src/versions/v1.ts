/*
import { Request, Response } from "express";

import { print, app, now, response } from "../api";

const version = "v1";

export function v1(api: app) {
  const uri: string = `${api.base_uri}v1/`;

  ping(api, uri);
  getVersion(api, uri);

  getNow(api, uri);
  getIP(api, uri);

  let sessions: sessions = newSessions();
  getSession(api, uri, sessions);
  getAllSessions(api, uri, sessions);
  updateSession(api, uri, sessions);
}

function updateSession(api: app, uri: string, sessions: sessions) {
  function getResponse():response {
    let body = {
      update: false
    }
    let res: response = {
      status: 404,
      body: body
    }
    return res;
  }

  api.server.get(`${uri}updateSession`, (req: Request, res: Response) => {
    let response = getResponse();
    const ip: string = getip(req);
    if (ip != "") {
      sessions.map.set(ip, newSession());
      response.body.update = true;
      response.status = 200
    }

    res.status(response.status).json(response.body);
  });
}

function update(ses: session) {
  if (ses?.time_left != undefined || ses?.last_update != undefined) {
    ses.time_left = (ses.time_left * 1000 - (now() - ses.last_update)) / 1000;
    ses.last_update = now();
    if (ses.time_left <= 0) {
      ses.expired = true;
      ses.time_left = -1;
      ses.last_update = -1;
    }
  }
}

function getAllSessions(api: app, uri: string, sessions: sessions) {
  function getResponse():response {
    let body = {
      sessions: sessions
    }
    let res: response = {
      status: 404,
      body: body
    }
    return res;
  }

  api.server.get(`${uri}getAllSessions`, (req: Request, res: Response) => {
    let response = getResponse();
    response.status = 200;
    res.status(response.status).json(response.body);
  });
}

function getSession(api: app, uri: string, sessions: sessions) {
  function getResponse():response {
    let body = {
      expired: true,
      time_left: -1,
      last_update: -1,
    }
    let res: response = {
      status: 404,
      body: body
    }
    return res;
  }

  api.server.get(`${uri}getSession`, (req: Request, res: Response) => {
    let response = getResponse();
    const ip = getip(req);

    print(`Session ${ip}`);

    if (ip == "") {
      //
    } else if (sessions.map.has(ip)) {
      let ses = sessions.map.get(ip);
      if (ses != undefined) {
        update(ses);
        print(`|_ Session found with expired = ${ses.expired}`);
        response.status = 200;
        response.body = ses;
      }
    }

    res.status(response.status).json(response.body);
  });
}

export function newSessions(): sessions {
  let esssessions: sessions = {
    map: new Map<string, session>(),
  };
  return esssessions;
}

export type sessions = {
  map: Map<string, session>;
};

export function newSession(): session {
  let esssession: session = {
    expired: false,
    time_left: 60,
    last_update: Date.now(),
  };
  return esssession;
}

export type session = {
  expired: boolean;
  time_left: number;
  last_update: number;
};

export function getip(req: Request): string {
  const ip: string | string[] | undefined =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip != undefined) return ip as string;
  return "";
}

function getIP(api: app, uri: string) {
  function getResponse():response {
    let body = {
      ip: ""
    }
    let res: response = {
      status: 404,
      body: body
    }
    return res;
  }

  api.server.get(`${uri}getIP`, (req: Request, res: Response) => {
    let response = getResponse();
    const ip = getip(req);
    if (ip != "") {
      response.status = 200;
      response.body.ip = ip;
    }

    res.status(response.status).json(response.body);
  });
}

function getNow(api: app, uri: string) {
  function getResponse():response {
    let body = {
      now: -1
    }
    let res: response = {
      status: 404,
      body: body
    }
    return res;
  }

  api.server.get(`${uri}now`, (req: Request, res: Response) => {
    let response = getResponse();
    response.body.now = now();
    response.status = 200;
    res.status(response.status).json(response.body);
  });
}

function getVersion(api: app, uri: string) {
  function getResponse():response {
    let body = {
      version: version
    }
    let res: response = {
      status: 200,
      body: body
    }
    return res;
  }

  api.server.get(`${uri}getVersion`, (req: Request, res: Response) => {
    let response = getResponse();
    res.status(response.status).json(response.body);
  });

  api.server.get(`${uri}version`, (req: Request, res: Response) => {
    let response = getResponse();
    res.status(response.status).json(response.body);
  });
}

function ping(api: app, uri: string) {
  function getResponse():response {
    let body = {
      ping: "pong"
    }
    let res: response = {
      status: 200,
      body: body
    }
    return res;
  }

  api.server.get(uri, (req: Request, res: Response) => {
    let response = getResponse();
    res.status(response.status).json(response.body);
  });
}
*/
import { response } from "../api";
import { v0 } from "./v0";
export class v1 extends v0 {
  post = {
    set: (params: { key: string; value: any }) => {
      const { key, value } = params;
      const newValue = `v1_${value}`;
      this.dataStore.set(key, newValue);
      return response();
    },
  };
}
