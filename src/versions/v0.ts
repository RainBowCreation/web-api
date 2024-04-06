import { Request, Response } from "express";

import { app, response } from "../api";

export function v0(api: app) {
  const uri: string = `${api.base_uri}`;

  ping(api, uri);
  getVersion(api, uri);
  getVersions(api, uri);
}

function getVersion(api: app, uri: string) {
  const response = {
    version: api.latest,
  };

  api.server.get(`${uri}getVersion`, (req: Request, res: Response) => {
    res.status(200).json(response);
  });

  api.server.get(`${uri}version`, (req: Request, res: Response) => {
    res.status(200).json(response);
  });

  api.server.get(`${uri}getLastest`, (req: Request, res: Response) => {
    res.status(200).json(response);
  });

  api.server.get(`${uri}lastest`, (req: Request, res: Response) => {
    res.status(200).json(response);
  });
}

function getVersions(api: app, uri: string) {
  function getResponse(): response {
    let body = {
      versions: api.versions,
    };
    let res: response = {
      status: 200,
      body: body,
    };
    return res;
  }

  api.server.get(`${uri}*getVersions`, (req: Request, res: Response) => {
    let response = getResponse()
    res.status(response.status).json(response.body);
  });

  api.server.get(`${uri}*versions`, (req: Request, res: Response) => {
    let response = getResponse()
    res.status(response.status).json(response.body);
  });
}

function ping(api: app, uri: string) {
  function getResponse(): response {
    let body = {
      ping: "pong",
    };
    let res: response = {
      status: 200,
      body: body,
    };
    return res;
  }

  api.server.get(uri, (req: Request, res: Response) => {
    let response = getResponse();
    res.status(response.status).json(response.body);
  });

  api.server.get(`${uri}*ping`, (req: Request, res: Response) => {
    let response = getResponse();
    res.status(response.status).json(response.body);
  });
}
