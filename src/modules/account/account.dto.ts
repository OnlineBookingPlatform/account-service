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

export class DTO_RQ_SuperAdmin {
  username: string;
  password: string;
  name: string;
}

export class DTO_RP_SuperAdmin {
  id: string;
  name: string;
  username: string;
  account_type: string;
}

export class DTO_RQ_UpdateSuperAdmin {
  id: string;
  name: string;
  username: string;
}

export class DTO_RQ_AccountByCompanyBus {
  id: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  gender: number;
  role: number;
  email: string;
  status: boolean;
  company_id: number;
}
export class DTO_RP_AccountByCompanyBus {
  id: string;
  name: string;
  username: string;
  phone: string;
  gender: number;
  role: number;
  email: string;
  status: boolean;
  company_id: number;
}
