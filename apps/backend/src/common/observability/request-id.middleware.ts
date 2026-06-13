import { Injectable, NestMiddleware } from '@nestjs/common';
import { nanoid } from 'nanoid';

import type { NextFunction, Request, Response } from 'express';

const HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header(HEADER);
    const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : nanoid(16);
    req.headers[HEADER] = id;
    res.setHeader(HEADER, id);
    next();
  }
}
