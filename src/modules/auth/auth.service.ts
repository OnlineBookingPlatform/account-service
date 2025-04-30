import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../account/account.schema';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
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
      throw new HttpException(
        'Tài khoản không tồn tại',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!isPasswordValid) {
      throw new HttpException(
        'Mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!user.status) {
      throw new HttpException('Tài khoản đã bị khóa', HttpStatus.UNAUTHORIZED);
    }
    // Role 4: Nhân viên // Role 5: Quản trị viên
    if (user.role !== 4 && user.role !== 5) {
      throw new HttpException(
        'Tài khoản không có quyền hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const companyDataString = await this.redisService.get(
      `company:${user.company_id}`,
    );
    console.log('Data from Redis:', companyDataString);
    const companyData = JSON.parse(companyDataString);
    console.log('Company Code:', companyData);
    if (!companyDataString) {
      throw new HttpException(
        'Không tìm thấy dữ liệu công ty',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

  async facebookLogin(
    data: DTO_RQ_FacebookLogin,
  ): Promise<DTO_RP_FacebookLogin> {
    console.log('📥 Received request:', data);

    // Facebook app credentials - should be in environment variables
    const clientId = process.env.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';
    const clientSecret =
      process.env.FACEBOOK_APP_SECRET || 'YOUR_FACEBOOK_APP_SECRET';

    try {
      let accessToken: string;

      // Handle two authentication flows: authorization code flow or access token flow
      if (data.accessToken) {
        // Access token flow - client already has token
        accessToken = data.accessToken;
      } else if (data.code && data.redirectUri) {
        // Authorization code flow - exchange code for token
        const tokenResponse = await fetch(
          `https://graph.facebook.com/v22.0/oauth/access_token?` +
            `client_id=${clientId}&` +
            `client_secret=${clientSecret}&` +
            `code=${data.code}&` +
            `redirect_uri=${encodeURIComponent(data.redirectUri)}`,
          {
            method: 'GET',
          },
        );

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Facebook token exchange error:', errorData);
          throw new HttpException(
            'Facebook OAuth Error: Failed to exchange code for token',
            HttpStatus.UNAUTHORIZED,
          );
        }

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
      } else {
        throw new HttpException(
          'Invalid authentication data: either code+redirectUri or accessToken is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get user profile with the access token
      const profileResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large),gender&access_token=${accessToken}`,
        {
          method: 'GET',
        },
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error('Facebook profile error:', errorData);
        throw new HttpException(
          'Facebook API Error: Failed to fetch user profile',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const userData = await profileResponse.json();
      console.log('📤 Response from Facebook:', userData);

      // Ensure we have an email address
      if (!userData.email) {
        throw new HttpException(
          'Email not provided by Facebook or permission not granted',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Find or create user account
      let account = await this.accountModel.findOne({
        email: userData.email,
        account_type: 'FACEBOOK',
      });

      if (!account) {
        account = new this.accountModel({
          name: userData.name,
          email: userData.email,
          url_avatar: userData.picture?.data?.url,
          account_type: 'FACEBOOK',
          role: 1, // Default role for Customer
          gender:
            userData.gender === 'male'
              ? 1
              : userData.gender === 'female'
                ? 2
                : 0,
        });
        await account.save();
      }

      // Generate JWT token
      const { accessToken: jwtToken } = await this.signJwtToken(
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
        token: jwtToken,
        role: account.role,
        gender: account.gender,
        phone: account.phone,
      };
    } catch (error) {
      console.error('Facebook login error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Facebook authentication failed: ' + (error.message || 'Unknown error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async superAdminLogin(
    data: DTO_RQ_SuperAdminLogin,
  ): Promise<DTO_RP_SuperAdminLogin> {
    console.log('📥 Received request:', data);
    const user = await this.accountModel.findOne({
      username: data.username,
      account_type: 'SUPERADMIN',
    });
    if (!user) {
      throw new HttpException(
        'Tài khoản không tồn tại',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isPasswordValid = await argon2.verify(user.password, data.password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (user.account_type !== 'SUPERADMIN' && user.role !== 99) {
      throw new HttpException(
        'Tài khoản không có quyền hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { accessToken } = await this.signJwtToken(
      user._id.toString(),
      user.account_type,
      user.role,
    );
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      token: accessToken,
      account_type: user.account_type,
    };
  }
}
