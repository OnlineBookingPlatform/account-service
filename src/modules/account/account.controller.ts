import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_GoogleLogin, DTO_RQ_Account, DTO_RQ_GoogleLogin } from './account.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @MessagePattern('get_users')
  getUsers() {
    return this.accountService.getUsers();
  }

  @MessagePattern('create_account')
  createAccount(@Payload() data: DTO_RQ_Account) {
    return this.accountService.createAccount(data);
  }

  @MessagePattern('google_login')
  async googleLogin(@Payload() data: DTO_RQ_GoogleLogin): Promise<ApiResponse<DTO_RP_GoogleLogin>> {
    try {
      const response = await this.accountService.googleLogin(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
