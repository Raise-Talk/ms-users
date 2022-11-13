import {
  IsEmail,
  isEmpty,
  IsNotEmpty,
  isNotEmpty,
  IsString,
} from 'class-validator';

export class ConfirmAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
