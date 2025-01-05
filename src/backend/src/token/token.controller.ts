import { Body, Controller, Get, Post } from '@nestjs/common';
import { TokenService, TonBalanceResult, TonTransactionsResult } from './token.service';

@Controller('token')
export class TokenController {

  private readonly tokenSerive: TokenService;

  constructor() {
    // can't use injectable property in azle, will cause undefined call
    this.tokenSerive = new TokenService();
  }

  @Get('hello')
  getHello(): string {
    return this.tokenSerive.getHello();
  }

  @Post('balance')
  async getBalance(
    @Body() body : { address: string },
  ): Promise<TonBalanceResult> {
    return this.tokenSerive.getBalance(body.address);
  }

  @Post('transactions')
  async getTransactions(
    @Body() body : { address: string },
  ): Promise<TonTransactionsResult> {
    return this.tokenSerive.getTransactions(body.address);
  }
}
