import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_Account, DTO_RQ_Account } from './account.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';
import { Account } from './account.schema';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @MessagePattern('create_account')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createAccount(
    @Payload() data: DTO_RQ_Account,
  ): Promise<ApiResponse<DTO_RP_Account>> {
    try {
      const response = await this.accountService.createAccount(data);
      return ApiResponse.success(response);
    } catch (err) {
      return handleError(err);
    }
  }

  @MessagePattern('get_account_info')
  async getAccountInfo(
    @Payload() data: { id: string },
  ): Promise<ApiResponse<Account>> {
    try {
      const response = await this.accountService.getAccountInfo(data.id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_account_info')
  async updateAccountInfo(
    @Payload() data: { id: string; data: DTO_RQ_Account },
  ): Promise<ApiResponse<Account>> {
    try {
      console.log('📥 Received request ID:', data.id);
      console.log('📥 Received request Data:', data.data);
      const response = await this.accountService.updateAccountInfo(
        data.id,
        data.data,
      );
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_avatar_account')
  async updateAvatarAccount(
    @Payload() data: { id: string; url_avatar: string },
  ): Promise<ApiResponse<Account>> {
    try {
      const response = await this.accountService.updateAvatarAccount(
        data.id,
        data.url_avatar,
      );
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
