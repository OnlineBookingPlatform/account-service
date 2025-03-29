import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '../account/account.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisService } from 'src/config/redis.service';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
})
export class AuthModule {}
