import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ConfirmAccountDto } from './confirm-account.dto';

export class ConfirmEmailDto extends PartialType(ConfirmAccountDto) {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
