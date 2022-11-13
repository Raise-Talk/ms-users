import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { LogoutUserDto } from './dto/logout-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResendAccountCodeDto } from './dto/resend-account-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.authenticateUser(loginUserDto);
  }

  @Post('/account/confirm')
  async confirmUser(@Body() confirmAccountDto: ConfirmAccountDto) {
    return await this.authService.confirmAccount(confirmAccountDto);
  }

  @Post('/account/resend/code')
  async resendAccountCode(@Body() resendAccountCodeDto: ResendAccountCodeDto) {
    return await this.authService.resendAccountCode(resendAccountCodeDto);
  }

  @Post('/email/confirm')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return await this.authService.confirmEmail(confirmEmailDto);
  }

  @Post('/logout')
  async logout(@Body() logoutUserDto: LogoutUserDto) {
    return await this.authService.logout(logoutUserDto);
  }
}
