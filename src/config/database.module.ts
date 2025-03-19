import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/modules/account/account.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://tuanthanh2603:CVbn12345@vinahome.kntwx.mongodb.net/',
    ),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
