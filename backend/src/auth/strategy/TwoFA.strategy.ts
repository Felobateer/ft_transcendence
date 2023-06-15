import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'nestjs-prisma';
import { Strategy } from 'passport-strategy';
import { authenticator } from 'otplib';

@Injectable()
export class TwoFA extends PassportStrategy(Strategy, '2fa') {
  constructor(private prisma: PrismaService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, code: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        userName: username,
      },
    });

    if (!user) {
      console.log('error: user not found');
      throw new UnauthorizedException('User not found');
    }

    const secret = user.twoFASecret;

    if (!secret) {
      console.log('no secret');
      throw new BadRequestException('2FA not activated');
    }

    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      console.log('invalid TOTP');
      throw new UnauthorizedException('Invalid TOTP code');
    }

    delete user.password;
    return user;
  }
}
