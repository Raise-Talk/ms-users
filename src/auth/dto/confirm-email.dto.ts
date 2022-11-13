import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, Matches } from 'class-validator';
import { ConfirmAccountDto } from './confirm-account.dto';

export class ConfirmEmailDto extends PartialType(ConfirmAccountDto) {
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'invalid password' },
  )
  @IsNotEmpty()
  password: string;
}
