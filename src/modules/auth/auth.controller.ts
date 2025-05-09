import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  DTO_RP_BMSLogin,
  DTO_RP_FacebookLogin,
  DTO_RP_GoogleLogin,
  DTO_RP_SuperAdminLogin,
  DTO_RQ_BMSLogin,
  DTO_RQ_FacebookLogin,
  DTO_RQ_GoogleLogin,
  DTO_RQ_SuperAdminLogin,
} from './auth.dto';
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

  @MessagePattern('facebook_login')
  async facebookLogin(
    @Payload() data: DTO_RQ_FacebookLogin,
  ): Promise<ApiResponse<DTO_RP_FacebookLogin>> {
    try {
      const response = await this.authService.facebookLogin(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('bms_login')
  async bmsLogin(
    @Payload() data: DTO_RQ_BMSLogin,
  ): Promise<ApiResponse<DTO_RP_BMSLogin>> {
    try {
      const response = await this.authService.bmsLogin(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('super_admin_login')
  async superAdminLogin(
    @Payload() data: DTO_RQ_SuperAdminLogin,
  ): Promise<ApiResponse<DTO_RP_SuperAdminLogin>> {
    try {
      const response = await this.authService.superAdminLogin(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
