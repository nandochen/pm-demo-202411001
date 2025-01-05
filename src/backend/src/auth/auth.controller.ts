import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { StandardResponseModel } from '../model/standard-response.model';

@Controller('auth')
export class AuthController {

  private readonly authService: AuthService;

  constructor() {
    // can't use injectable property in azle, will cause undefined call
    this.authService = new AuthService();
  }

  @Post('get-access-token')
  async getAccessToken(
    @Body() body : { principalId: string },
  ): Promise<StandardResponseModel> {
    return this.authService.getAccessToken(body.principalId);
  }
}
