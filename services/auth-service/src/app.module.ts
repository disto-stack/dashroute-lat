import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { SecurityModule } from './infrastructure/security/security.module.js';
import { CaslModule } from './infrastructure/casl/casl.module.js';
import { AuthHttpModule } from './infrastructure/http/auth-http.module.js';

@Module({
  imports: [DatabaseModule, SecurityModule, CaslModule, AuthHttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
