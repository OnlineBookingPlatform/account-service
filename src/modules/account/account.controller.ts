import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RQ_Account } from './account.dto';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @MessagePattern('get_users')
  getUsers() {
    return this.accountService.getUsers();
  }

  @MessagePattern('create_account')
  createAccount(@Payload() data: DTO_RQ_Account) {
    return this.accountService.createAccount(data);
  }
}
