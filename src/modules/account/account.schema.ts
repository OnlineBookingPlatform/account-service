import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ collection: 'tbl_accounts', timestamps: true })
export class Account extends Document {
  @Prop()
  username: string;
  @Prop()
  password: string;
  @Prop()
  phone: string;
  @Prop()
  url_avatar: string;
  @Prop()
  date_birth: Date;
  @Prop()
  gender: number;
  @Prop()
  email: string;
  @Prop()
  role: number;
  @Prop()
  account_type: string;
  @Prop()
  name: string;
  @Prop()
  status: boolean;
}
export const AccountSchema = SchemaFactory.createForClass(Account);
