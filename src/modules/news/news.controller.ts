import { Controller } from '@nestjs/common';
import { NewsService } from './news.service';
import { MessagePattern } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_ReceiveNews, DTO_RQ_ReceiveNews } from './news.dto';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
  @MessagePattern('register_receive_news')
  async registerReceiveNews(
    data: DTO_RQ_ReceiveNews,
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.newsService.registerReceiveNews(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_list_receive_news')
  async getListReceiveNews(): Promise<ApiResponse<DTO_RP_ReceiveNews[]>> {
    try {
      const response = await this.newsService.getListReceiveNews();
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
