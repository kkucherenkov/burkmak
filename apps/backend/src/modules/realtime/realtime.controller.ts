import { Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';

import { RealtimeService, type RealtimeToken } from './realtime.service';

import type { Request } from 'express';

@Controller({ path: 'realtime', version: '1' })
export class RealtimeController {
  constructor(private readonly realtime: RealtimeService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async issueToken(@Req() req: Request): Promise<RealtimeToken> {
    return this.realtime.issueToken(req);
  }
}
