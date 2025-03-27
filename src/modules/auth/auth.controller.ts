import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_GoogleLogin, DTO_RQ_GoogleLogin } from './auth.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('google_login')
  async googleLogin(
    @Payload() data: DTO_RQ_GoogleLogin,
  ): Promise<ApiResponse<DTO_RP_GoogleLogin>> {
    try {
      const response = await this.authService.googleLogin(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('bms_login')
  async bmsLogin(
    @Payload() data: DTO_RQ_GoogleLogin,
  ): Promise<ApiResponse<DTO_RP_GoogleLogin>> {
    try {
      // const response = await this.authService.bmsLogin(data);
      // return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
