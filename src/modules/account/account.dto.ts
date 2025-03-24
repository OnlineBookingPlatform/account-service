export class DTO_RQ_Account {
  username: string;
  password: string;
  phone: string;
  url_avatar: string;
  date_birth: Date;
  gender: number;
  email: string;
  role: number;
  account_type: string;
  name: string;
  status: boolean;
}
export class DTO_RQ_GoogleLogin {
  accessToken: string;
}
export class DTO_RP_GoogleLogin {
  id: string;
  name: string;
  email: string;
  url_avatar: string;
  account_type: string;
  token: string;
  role: number;
}