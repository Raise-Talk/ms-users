import { IsEmail, IsNotEmpty } from 'class-validator';

export class LogoutUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
