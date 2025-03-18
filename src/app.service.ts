import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private users = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
  ];

  getUsers() {
    return this.users;
  }
}
