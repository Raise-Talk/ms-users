import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  me(@Query('accessToken') accessToken: string) {
    return this.usersService.me(accessToken);
  }

  @Get('/list')
  list() {
    return this.usersService.list();
  }

  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('/update')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete('/delete')
  delete(@Body() deleteUserDto: DeleteUserDto) {
    return this.usersService.delete(deleteUserDto);
  }
}
