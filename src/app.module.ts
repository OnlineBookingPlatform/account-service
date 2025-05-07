/* eslint-disable prettier/prettier */
import { Module, OnModuleInit } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { NewsModule } from './modules/news/news.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://tuanthanh2603:CVbn12345@vinahome.kntwx.mongodb.net/',
      { dbName: 'vinahome_db_v1' },
    ),
    AccountModule, AuthModule, NewsModule,
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    try {
      await mongoose.connect(
        'mongodb+srv://tuanthanh2603:CVbn12345@vinahome.kntwx.mongodb.net/vinahome_db_v1'
      );
      console.log('✅ Kết nối MongoDB thành công!');
    } catch (error) {
      console.error('❌ Kết nối MongoDB thất bại!', error);
    }
  }
}
