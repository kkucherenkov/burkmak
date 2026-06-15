import { Global, Module, forwardRef } from '@nestjs/common';

import { IntegrationsModule } from '../../modules/integrations/integrations.module';
import { TokensModule } from '../../modules/tokens/tokens.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PatService } from './pat.service';

@Global()
@Module({
  // forwardRef avoids a potential circular initialisation order between
  // AuthModule (global, loaded early) and TokensModule (domain module).
  imports: [IntegrationsModule, forwardRef(() => TokensModule)],
  controllers: [AuthController],
  // PatService lives in AuthModule so that — as a @Global() module — it is
  // visible to every other module that uses SessionGuard (e.g. EventsModule).
  providers: [AuthService, PatService],
  exports: [AuthService, PatService],
})
export class AuthModule {}
