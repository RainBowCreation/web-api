/*
import { Request, Response } from "express";

import { app, response } from "../api";

const version = "v0";

export function v0(api: app) {
  const uri: string = `${api.base_uri}`;

  ping(api, uri);
  getVersion(api, uri);
  getVersions(api, uri);
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

  api.server.get(`${uri}getLatest`, (req: Request, res: Response) => {
    let response = getResponse();
    response.body.latest = api.latest;
    res.status(response.status).json(response.body);
  });

  api.server.get(`${uri}latest`, (req: Request, res: Response) => {
    let response = getResponse();
    response.body.latest = api.latest;
    res.status(response.status).json(response.body);
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
  */

export class v0 {
  getData() {
      return "Data from Base API";
  }

  postData(data: any) {
      return `Posted to Base API: ${data}`;
  }
}