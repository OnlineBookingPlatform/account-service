import { Module, OnModuleInit } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://tuanthanh2603:CVbn12345@vinahome.kntwx.mongodb.net/',
      { dbName: 'vinahome_db_v1' },
    ),
    AccountModule,
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      console.log('✅ Kết nối MongoDB thành công!');
    } else {
      console.error('❌ Kết nối MongoDB thất bại!');
    }
  }
}
