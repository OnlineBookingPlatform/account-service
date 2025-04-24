/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DTO_RQ_Account } from './account.dto';
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
}
