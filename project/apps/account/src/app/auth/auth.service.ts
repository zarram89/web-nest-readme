import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { RegisterDto as CreateUserDto } from './dto/register.dto';
import { LoginDto as LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('NOTIFY_SERVICE') private readonly notifyClient: ClientProxy,
  ) { }

  async register(dto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.usersService.create(dto);

    this.notifyClient.emit({ cmd: 'user.registered' }, {
      email: newUser.email,
      name: newUser.name,
    }).subscribe();

    const tokens = await this.generateTokens(newUser.id, newUser.email);
    return {
      ...newUser,
      ...tokens,
    };
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.comparePassword(
      loginDto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.configService.get<string>('jwt.accessExpiration') as any,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.configService.get<string>('jwt.refreshExpiration') as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
