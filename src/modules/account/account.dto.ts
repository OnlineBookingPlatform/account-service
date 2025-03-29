import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class DTO_RQ_Account {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsBoolean()
  status: boolean;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDate()
  @IsOptional()
  date_birth?: Date;

  @IsString()
  @IsOptional()
  citizen_id?: string;

  @IsInt()
  @IsOptional()
  gender?: number;

  @IsInt()
  role: number;

  @IsString()
  @IsOptional()
  license_class?: string;

  @IsDate()
  @IsOptional()
  license_expiry_date?: Date;

  @IsString()
  @IsOptional()
  area?: string;

  @IsInt()
  company_id: number;
}

export class DTO_RQ_GoogleLogin {
  accessToken: string;
}
export class DTO_RP_AccountInfo {
  _id: string;
  name: string;
  email: string;
  url_avatar: string;
  account_type: string;
  token: string;
  role: number;
}
