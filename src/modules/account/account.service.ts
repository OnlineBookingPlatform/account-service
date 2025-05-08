/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DTO_RP_AccountByCompanyBus, DTO_RP_SuperAdmin, DTO_RQ_Account, DTO_RQ_AccountByCompanyBus, DTO_RQ_SuperAdmin, DTO_RQ_UpdateSuperAdmin } from './account.dto';
import * as argon2 from 'argon2';
import { Account } from './account.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) { }

  async createAccount(data: DTO_RQ_Account): Promise<Account> {
    // Log request (ẩn thông tin nhạy cảm)
    console.log('📥 Received request:', {
      ...data,
      password: '***',
      _id: data._id || 'auto-generated'
    });

    try {
      // 1. Kiểm tra username đã tồn tại chưa
      const existingAccount = await this.accountModel.findOne({ username: data.username }).lean();
      if (existingAccount) {
        throw new HttpException('Tên tài khoản đã tồn tại', HttpStatus.BAD_REQUEST);
      }

      // 2. Hash password
      const hashedPassword = await argon2.hash(data.password);

      // 3. Chuẩn bị dữ liệu tài khoản mới (loại bỏ _id nếu có)
      const accountData = {
        ...data,
        password: hashedPassword,
        account_type: 'BMS',
        _id: undefined // Đảm bảo MongoDB sẽ tự sinh ID
      };
      delete accountData._id; // Xóa trường _id nếu tồn tại

      // 4. Tạo và lưu tài khoản mới
      const newAccount = new this.accountModel(accountData);
      const savedAccount = await newAccount.save();

      // 5. Log kết quả (không bao gồm thông tin nhạy cảm)
      console.log('✅ Account created successfully:', {
        _id: savedAccount._id,
        username: savedAccount.username,
        account_type: savedAccount.account_type
      });

      // 6. Trả về thông tin tài khoản (đã convert thành plain object)
      return savedAccount.toObject() as Account;

    } catch (error) {
      console.error('❌ Account creation failed:', error);

      // Xử lý các loại lỗi khác nhau
      if (error instanceof HttpException) {
        throw error; // Giữ nguyên các lỗi đã được xử lý
      }

      if (error.name === 'ValidationError') {
        throw new HttpException(
          'Dữ liệu tài khoản không hợp lệ: ' + error.message,
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Lỗi hệ thống khi tạo tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getAccountInfo(id: string): Promise<Account> {
    console.log('📥 Received request:', id);
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  async updateAccountInfo(id: string, data: DTO_RQ_Account): Promise<Account> {
    console.log('📥 Received request ID:', id);
    console.log('📥 Received request Data:', data);
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    account.set(data);
    await account.save();
    return account;
  }

  async updateAvatarAccount(id: string, url_avatar: string): Promise<Account> {
    console.log('📥 Received request ID:', id);
    console.log('📥 Received request URL Avatar:', url_avatar);
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    // account.url_avatar = url_avatar;
    account.set(url_avatar);
    await account.save();
    console.log('✅ Updated account:', account);
    return account;
  }

  async getAllAccountByCompany(id: number): Promise<Account[]> {
    console.log('📥 Received request:', id);
    const accounts = await this.accountModel.find({ company_id: id });
    return accounts;
  }
  async deleteAccount(id: string): Promise<void> {
    console.log('📥 Received request:', id);
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Dữ liệu tài khoản không tồn tại', HttpStatus.NOT_FOUND);
    }
    await account.deleteOne();
  }

  async createSuperAdminAccount(data: DTO_RQ_SuperAdmin): Promise<DTO_RP_SuperAdmin> {
    console.log('📥 Received request:', data);
    try {
      // 1. Kiểm tra username đã tồn tại chưa
      const existingAccount = await this.accountModel.findOne({
        username: data.username,
        account_type: 'SUPERADMIN'
      }).lean();
      if (existingAccount) {
        throw new HttpException('Tài khoản đã tồn tại', HttpStatus.BAD_REQUEST);
      }
      // 2. Hash password
      const hashedPassword = await argon2.hash(data.password);
      // 3. Tạo tài khoản mới
      const newAccount = new this.accountModel({
        ...data,
        password: hashedPassword,
        account_type: 'SUPERADMIN',
        role: 99,
      });
      const savedAccount = await newAccount.save();
      // 4. Trả về thông tin tài khoản
      return {
        id: savedAccount.id,
        username: savedAccount.username,
        name: savedAccount.name,
        account_type: savedAccount.account_type,
      };
    } catch (error) {
      console.error('❌ Account creation failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new HttpException(
          'Dữ liệu tài khoản không hợp lệ: ' + error.message,
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        'Lỗi hệ thống khi tạo tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getListSuperAdminAccount(): Promise<DTO_RP_SuperAdmin[]> {
    const accounts = await this.accountModel.find({ account_type: 'SUPERADMIN' });
    return accounts.map(account => ({
      id: account.id,
      username: account.username,
      name: account.name,
      account_type: account.account_type,
    }));
  }

  async deleteSuperAdminAccount(id: string): Promise<void> {
    console.log('📥 Received request:', id);
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND);
    }
    await account.deleteOne();
  }

  async updateSuperAdminAccount(id: string, data: DTO_RQ_UpdateSuperAdmin): Promise<DTO_RP_SuperAdmin> {
    console.log('📥 Received request ID:', id);
    console.log('📥 Received request Data:', data);

    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND);
    }

    // Chỉ cập nhật các trường được phép
    account.name = data.name;
    account.username = data.username;

    await account.save();

    return {
      id: account.id,
      username: account.username,
      name: account.name,
      account_type: account.account_type,
    };
  }

  async createAccountBySuperAdmin(data: DTO_RQ_AccountByCompanyBus): Promise<DTO_RP_AccountByCompanyBus> {
    console.log('📥 Received request:', data);
    try {
      const existingAccount = await this.accountModel.findOne({
        username: data.username,
        account_type: 'BMS'
      }).lean();
      if (existingAccount) {
        throw new HttpException('Tài khoản đã tồn tại', HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = await argon2.hash(data.password);
      const newAccount = new this.accountModel({
        ...data,
        password: hashedPassword,
        account_type: 'BMS',
      });
      const savedAccount = await newAccount.save();
      return {
        id: savedAccount.id,
        username: savedAccount.username,
        name: savedAccount.name,
        phone: savedAccount.phone,
        email: savedAccount.email,
        role: savedAccount.role,
        status: savedAccount.status,
        gender: savedAccount.gender,
        company_id: savedAccount.company_id,
      }
    } catch (error) {
      throw new HttpException(
        'Lỗi hệ thống khi tạo tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getListAccountByCompanyOnPlatform(id: number): Promise<DTO_RP_AccountByCompanyBus[]> {
    console.log('📥 Received request:', id);
    const accounts = await this.accountModel.find({ company_id: id, account_type: 'BMS' });
    return accounts.map(account => ({
      id: account.id,
      username: account.username,
      name: account.name,
      phone: account.phone,
      email: account.email,
      role: account.role,
      gender: account.gender,
      company_id: account.company_id,
      status: account.status,
    }));
  }
  async deleteAccountBySuperAdmin(id: string): Promise<void> {
    console.log('📥 Received request:', id);
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND); 
    }
    await account.deleteOne();
  }
  
  async updateAccountBySuperAdmin(id: string, data: DTO_RQ_AccountByCompanyBus): Promise<DTO_RP_AccountByCompanyBus> {
    console.log('📥 Received request ID:', id);
    console.log('📥 Received request Data:', data);

    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND);
    }

    account.name = data.name;
    account.username = data.username;
    account.phone = data.phone;
    account.email = data.email;
    account.role = data.role;
    account.status = data.status;
    account.gender = data.gender;

    await account.save();
    return {
      id: account.id,
      username: account.username,
      name: account.name,
      phone: account.phone,
      email: account.email,
      role: account.role,
      status: account.status,
      gender: account.gender,
      company_id: account.company_id,
    }
  }

  async resetDefaultPassword(id: string): Promise<{ success: boolean; message: string }> {
    console.log('📥 Received password change request for ID:', id);
    
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND);
    }

    try {
      const defaultPassword = process.env.DEFAULT_PASSWORD || '12345678';

      // Mã hoá mật khẩu
      const hashedPassword = await argon2.hash(defaultPassword);

      // Cập nhật mật khẩu
      account.password = hashedPassword;
      await account.save();
      
      console.log('✅ Mật khẩu đã được thay đổi thành công:', id);
      return {
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công'
      };
    } catch (error) {
      console.error('❌ Mật khẩu thay đổi thất bại:', error);
      throw new HttpException(
        'Lỗi hệ thống khi thay đổi mật khẩu',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
