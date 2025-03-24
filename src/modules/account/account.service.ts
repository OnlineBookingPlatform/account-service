import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DTO_RP_Account,
  DTO_RQ_Account,
} from './account.dto';
import * as argon2 from 'argon2';
import { Account } from './account.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse } from 'src/utils/api-response';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async createAccount(data: DTO_RQ_Account) {
    console.log('📥 Received request:', data);
    const hashedPassword = await argon2.hash(data.password);

    const newAccount = new this.accountModel({
      ...data,
      password: hashedPassword,
    });

    const savedAccount = await newAccount.save();
    console.log('📝 New Account:', savedAccount);

    return {
      id: savedAccount._id,
      ...savedAccount.toObject(),
    };
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
}
