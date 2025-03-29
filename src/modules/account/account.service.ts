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
  ) {}

  async createAccount(data: DTO_RQ_Account): Promise<Account> {
    console.log('📥 Received request:', data);
    const existingAccount = await this.accountModel.findOne({ username: data.username });
    if (existingAccount) {
      throw new HttpException('Tên tài khoản đã tồn tại', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await argon2.hash(data.password);

    const newAccount = new this.accountModel({
      ...data,
      password: hashedPassword,
      account_type: 'BMS',
    });

    const savedAccount = await newAccount.save();
    console.log('📝 New Account:', savedAccount);

    return savedAccount.toObject() as Account;
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
