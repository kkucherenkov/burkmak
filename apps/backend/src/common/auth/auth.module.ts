import { Global, Module } from '@nestjs/common';

import { IntegrationsModule } from '../../modules/integrations/integrations.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [IntegrationsModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
