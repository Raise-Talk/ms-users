import { IsEmail, IsNotEmpty, isNotEmpty, Matches } from 'class-validator';

export class ResendAccountCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
