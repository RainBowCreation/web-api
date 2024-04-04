import { Request, Response } from "express";

import { print, app, now } from "../api";
import { escape } from "querystring";

export function v1(api: app) {
  const uri: string = `${api.base_uri}v1/`;

  ping(api, uri);
  getNow(api, uri);
  getIP(api, uri);

  let sessions: sessions = newSessions();
  getSession(api, uri, sessions);
  getAllSessions(api, uri, sessions);
  updateSession(api, uri, sessions);
}

function updateSession(api: app, uri: string, sessions: sessions) {
  let status: number = 404;
  let response = {
    update: false,
  };

  api.server.get(`${uri}updateSession`, (req: Request, res: Response) => {
    const ip: string = getip(req);
    if (ip != "" && sessions.map.has(ip)) {
      let ses = sessions.map.get(ip);
      if (ses != undefined) update(ses);
      if (ses === undefined || ses.time_left <= 0) {
        sessions.map.set(ip, newSession());
        response.update = true;
      }
    } else {
      sessions.map.set(ip, newSession());
      response.update = true;
    }

    status = 200;
    res.status(status).json(response);
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
  let status: number = 404;
  let response = sessions;
  api.server.get(`${uri}getAllSessions`, (req: Request, res: Response) => {
    for (let i in sessions.map.keys()) {
        let ses = sessions.map.get(i);
        if (ses != undefined)
            update(ses)
    }
    status = 200;
    res.status(status).json(response);
  });
}

function getSession(api: app, uri: string, sessions: sessions) {
  let status: number = 404;
  let response = {
    expired: true,
    time_left: -1,
    last_update: -1,
  };

  api.server.get(`${uri}getSession`, (req: Request, res: Response) => {
    const ip = getip(req);

    if (ip != "" && sessions.map.has(ip)) {
      if (!sessions.map.get(ip)?.expired) {
        let ses = sessions.map.get(ip);
        if (ses != undefined) {
            update(ses);
            response = ses;
        }
      }
    }

    status = 200;
    res.status(status).json(response);
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

function getip(req: Request): string {
  const ip: string | string[] | undefined =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip != undefined) return ip as string;
  return "";
}

function getIP(api: app, uri: string) {
  let status: number = 404;
  let response = {
    ip: "",
  };
  api.server.get(`${uri}getIP`, (req: Request, res: Response) => {
    const ip = getip(req);
    if (ip != "") {
      response.ip = ip;
    }

    status = 200;
    res.status(status).json(response);
  });
}

function getNow(api: app, uri: string) {
  let status: number = 404;
  let response = {
    now: -1,
  };

  api.server.get(`${uri}now`, (req: Request, res: Response) => {
    response.now = now();

    status = 200;
    res.status(status).json(response);
  });
}

function getVersion(api: app, uri: string) {
  let status: number = 404;
  let response = {
    version: "",
  };

  api.server.get(`${uri}getVersion`, (req: Request, res: Response) => {
    response.version = "v1";

    status = 200;
    res.status(status).json(response);
  });
}

function ping(api: app, uri: string) {
  let status: number = 404;
  let response = {
    ping: "pong",
  };

  api.server.get(uri, (req: Request, res: Response) => {
    status = 200;
    res.status(status).json(response);
  });

  api.server.get(`${uri}ping`, (req: Request, res: Response) => {
    status = 200;
    res.status(status).json(response);
  });
}
