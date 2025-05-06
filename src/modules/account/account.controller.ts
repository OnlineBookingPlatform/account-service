/* eslint-disable prettier/prettier */
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {  DTO_RP_AccountByCompanyBus, DTO_RP_SuperAdmin, DTO_RQ_Account, DTO_RQ_AccountByCompanyBus, DTO_RQ_SuperAdmin, DTO_RQ_UpdateSuperAdmin } from './account.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';
import { Account } from './account.schema';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // Tạo tài khoản BMS
  @MessagePattern('create_account')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createAccount(
    @Payload() data: DTO_RQ_Account,
  ): Promise<ApiResponse<Account>> {
    try {
      const response = await this.accountService.createAccount(data);
      return ApiResponse.success(response);
    } catch (err) {
      return handleError(err);
    }
  }

  // Lấy danh sách tài khoản thuộc công ty
  @MessagePattern('get_all_account_by_company')
  async getAllAccountByCompany(
    @Payload() data: { id: number },
  ): Promise<ApiResponse<Account[]>> {
    try {
      const response = await this.accountService.getAllAccountByCompany(data.id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
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

  @MessagePattern('delete_account')
  async deleteAccount(
    @Payload() data: { id: string },
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.accountService.deleteAccount(data.id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  // Tạo tài khoản super admin
  @MessagePattern('create_super_admin_account')
  async createSuperAdminAccount(
    @Payload() data: DTO_RQ_SuperAdmin,
  ): Promise<ApiResponse<DTO_RP_SuperAdmin>> {
    try {
      const response = await this.accountService.createSuperAdminAccount(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  // Lấy danh sách tài khoản super admin
  @MessagePattern('get_list_super_admin_account')
  async getListSuperAdminAccount(): Promise<ApiResponse<DTO_RP_SuperAdmin[]>> {
    try {
      const response = await this.accountService.getListSuperAdminAccount();
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  // Xoá tài khoản Super Admin
  @MessagePattern('delete_super_admin_account')
  async deleteSuperAdminAccount(
    @Payload() data: { id: string },
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.accountService.deleteSuperAdminAccount(data.id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  // Cập nhât tài khoản Super Admin
  @MessagePattern('update_super_admin_account')
  async updateSuperAdminAccount(
    @Payload() data: { id: string; data: DTO_RQ_UpdateSuperAdmin },
  ): Promise<ApiResponse<DTO_RP_SuperAdmin>> {
    try {
      const response = await this.accountService.updateSuperAdminAccount(
        data.id,
        data.data,
      );
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('create_account_by_super_admin')
  async createAccountBySuperAdmin(
    @Payload() data: DTO_RQ_AccountByCompanyBus,
  ): Promise<ApiResponse<DTO_RP_AccountByCompanyBus>> {
    try {
      const response = await this.accountService.createAccountBySuperAdmin(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_list_account_by_company_on_platform')
  async getListAccountByCompanyOnPlatform(
    @Payload() data: { id: number },
  ): Promise<ApiResponse<DTO_RP_AccountByCompanyBus[]>> {
    try {
      const response = await this.accountService.getListAccountByCompanyOnPlatform(data.id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('delete_account_by_super_admin')
  async deleteAccountBySuperAdmin(
    @Payload() data: { id: string },
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.accountService.deleteAccountBySuperAdmin(data.id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_account_by_super_admin')
  async updateAccountBySuperAdmin(
    @Payload() data: { id: string; data: DTO_RQ_AccountByCompanyBus },
  ): Promise<ApiResponse<DTO_RP_AccountByCompanyBus>> {
    try {
      const response = await this.accountService.updateAccountBySuperAdmin(
        data.id,
        data.data,
      );
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('change_password')
  async changePassword(
    @Payload() data: { id: string; newPassword: string },
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await this.accountService.changePassword(
        data.id,
        data.newPassword,
      );
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
