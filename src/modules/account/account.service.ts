import { Injectable } from '@nestjs/common';
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
  private users = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
  ];

  getUsers() {
    return this.users;
  }
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
}
