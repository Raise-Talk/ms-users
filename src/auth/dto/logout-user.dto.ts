import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutUserDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
