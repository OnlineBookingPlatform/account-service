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
  export class DTO_RQ_BMSLogin {
    username: string;
    password: string;
  }
  export class DTO_RP_BMSLogin {
    id: string;
    company_id: number;
    code: string;
    name: string;
    token: string;
    role: number;
  }