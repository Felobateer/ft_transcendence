import { Body, Controller, Get, Patch, Post, UploadedFile, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UpdateDto } from 'src/auth/dto';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller('user')
// Guard is at control level, because all user-related actions
// need validation.
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  // GetUser custom decorator, because Request is error prone
  // and like this we can return a prisma type user.
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me/update') 
  @ApiOkResponse({ description: 'User info has been updated.' })
  @ApiBadRequestResponse({ description: 'Update failed. Please try again!' })
  async edit(@GetUser() user: User, @Body() updateDto: UpdateDto) {
    await this.userService.updateUser(user, updateDto);
    return user;
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadFile(@UploadedFiles() file) {
      console.log('file log: ', file);
  }
}
