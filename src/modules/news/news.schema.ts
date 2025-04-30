import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'tbl_news', timestamps: true })
export class News {
  @Prop()
  email: string;
  @Prop()
  createdAt: Date;
}
export const NewsSchema = SchemaFactory.createForClass(News);
