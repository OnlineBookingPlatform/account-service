import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../account/account.schema';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import {
  DTO_RP_BMSLogin,
  DTO_RP_GoogleLogin,
  DTO_RQ_BMSLogin,
  DTO_RQ_GoogleLogin,
} from './auth.dto';
import { RedisService } from 'src/config/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private jwtService: JwtService,
    private redisService: RedisService,
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
      expiresIn: '2h',
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
    });
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
      gender: account.gender,
      phone: account.phone,
    };
  }

  async bmsLogin(data: DTO_RQ_BMSLogin): Promise<DTO_RP_BMSLogin> {
    console.log('📥 Received request:', data); 
    const user = await this.accountModel.findOne({ username: data.username });
    const isPasswordValid = await argon2.verify(user.password, data.password);

    if (!user) {
      throw new HttpException('Tài khoản không tồn tại', HttpStatus.UNAUTHORIZED);
    }
    if (!isPasswordValid) {
      throw new HttpException('Mật khẩu không chính xác', HttpStatus.UNAUTHORIZED);
    }
    if (!user.status) {
      throw new HttpException('Tài khoản đã bị khóa', HttpStatus.UNAUTHORIZED);
    }
    // Role 4: Nhân viên // Role 5: Quản trị viên
    if(user.role !== 4 && user.role !== 5) {
      throw new HttpException('Tài khoản không có quyền hợp lệ', HttpStatus.UNAUTHORIZED);
    }

    const companyDataString  = await this.redisService.get(`company:${user.company_id}`);
    console.log('Data from Redis:', companyDataString );
    const companyData = JSON.parse(companyDataString);
    console.log('Company Code:', companyData);
    if (!companyDataString) {
      throw new HttpException('Không tìm thấy dữ liệu công ty', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!companyData.status) {
      throw new HttpException('Công ty đã bị khóa', HttpStatus.FORBIDDEN);
    }

    const { accessToken } = await this.signJwtToken(
      user._id.toString(),
      user.account_type,
      user.role,
    );

    return {
      id: user._id.toString(),
      company_id: user.company_id,
      code: companyData.code,
      name: user.name,
      token: accessToken,
      role: user.role,
    };
  }
}
