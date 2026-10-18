import { Controller, Post, Body } from '@nestjs/common';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { AuthService } from './auth.service';

class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body.email, body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
