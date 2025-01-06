import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(user: LoginUserDto) {
    if (!user.email || !user.password) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const userResponse = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (!userResponse) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isPasswordCorrect = await bcrypt.compare(
      user.password,
      userResponse.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = {
      sub: userResponse.id,
      email: userResponse.email,
    };
    const accessToken = this.jwtService.sign(payload);
    delete userResponse.password;
    return { accessToken, userResponse };
  }
  async register(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'User email must be unique',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.UNAUTHORIZED);
    }

    const token = this.jwtService.sign({ email: user.email });
    await this.prisma.resetToken.create({
      data: {
        email,
        token,
      },
    });

    const resetLink =  `http://localhost:3000/reset-password?token=${token}`;
    const emailHtml = `
    <h1>Password Reset Request</h1>
    <p>Hello ${user.name},</p>
    <p>You requested to reset your password. Click the link below to set a new password:</p>
    <p>
      <a href="${resetLink}" target="_blank">Reset Password</a>
    </p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 24 hours.</p>
  `;
  await this.mailerService.sendMail({
    to: email,
    subject: 'Password Reset Request',
    html: emailHtml,
  });
  }

 async resetPassword(token: string, newPassword: string): Promise<void> {

    const resetToken = await this.prisma.resetToken.findFirst({
      where: {
        token,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired token');
    }


    const tokenAge = Date.now() - resetToken.createdAt.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Token has expired');
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
     await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      this.prisma.resetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
    ]);

  }



  remove(id: number) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
