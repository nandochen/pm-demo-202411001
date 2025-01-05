import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenController } from './token/token.controller';
import { TokenService } from './token/token.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [TokenController],
  providers: [TokenService],
})
export class AppModule {}
