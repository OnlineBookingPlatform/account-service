import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { News } from './news.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DTO_RP_ReceiveNews, DTO_RQ_ReceiveNews } from './news.dto';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<News>) {}

  async registerReceiveNews(data: DTO_RQ_ReceiveNews): Promise<void> {
    const { email } = data;
    const existing = await this.newsModel.findOne({ email });
    if (existing) {
      throw new HttpException(
        'Email đã tồn tại trong danh sách nhận tin tức',
        HttpStatus.BAD_REQUEST,
      );
    }
    const news = new this.newsModel({ email });
    await news.save();
  }
  async getListReceiveNews(): Promise<DTO_RP_ReceiveNews[]> {
    const newsList = await this.newsModel.find().sort({ createdAt: -1 });
    return newsList.map((news) => ({
      id: news._id.toString(),
      email: news.email,
      createdAt: news.createdAt.toString(),
    }));
  }
}
