import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../account/account.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { DTO_RP_GoogleLogin, DTO_RQ_GoogleLogin } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private jwtService: JwtService,
  ) {}

  async signJwtToken(
    _id: string,
    account_type: string,
    role: number,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: _id,
      account_type,
      role,
    };

    const jwtString = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
      secret: 'CVbn12345',
    });

    return {
      accessToken: jwtString,
    };
  }

  async googleLogin(data: DTO_RQ_GoogleLogin): Promise<DTO_RP_GoogleLogin> {
      console.log('📥 Received request:', data);
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        },
      );
      if (!response.ok) {
        throw new HttpException(
          'Google API Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
  
      const userData = await response.json();
      console.log('📤 Response from Google:', userData);
  
      let account = await this.accountModel.findOne({
        email: userData.email,
        account_type: 'GOOGLE',
    })
      if (!account) {
        account = new this.accountModel({
          name: userData.name,
          email: userData.email,
          url_avatar: userData.picture,
          account_type: 'GOOGLE', // Loại tài khoản mặc định
          role: 1, // Quyền mặc định cho Customer
        });
        await account.save();
      }
  
      const { accessToken } = await this.signJwtToken(
        account._id.toString(),
        account.account_type,
        account.role,
      );
  
      return {
        id: account._id.toString(),
        name: account.name,
        email: account.email,
        url_avatar: account.url_avatar,
        account_type: account.account_type,
        token: accessToken,
        role: account.role,
      };
    }

}
