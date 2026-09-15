import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { SecurityModule } from './infrastructure/security/security.module.js';
import { CaslModule } from './infrastructure/casl/casl.module.js';
import { AuthHttpModule } from './infrastructure/http/auth-http.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule, 
    SecurityModule, 
    CaslModule, 
    AuthHttpModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
