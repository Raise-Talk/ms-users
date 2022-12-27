import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
