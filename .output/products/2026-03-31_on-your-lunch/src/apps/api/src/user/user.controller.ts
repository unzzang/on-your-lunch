import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common';
import { UserService } from './user.service';

@ApiTags('사용자')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  async getMe(@CurrentUser() user: { userId: string }) {
    return this.userService.getMe(user.userId);
  }

  @Put('me/location')
  @ApiOperation({ summary: '회사 위치 설정/변경' })
  async updateLocation(
    @CurrentUser() user: { userId: string },
    @Body() body: { latitude: number; longitude: number; address: string; buildingName?: string },
  ) {
    return this.userService.updateLocation(user.userId, body);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: '취향 설정/변경' })
  async updatePreferences(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      preferredCategoryIds: string[];
      excludedCategoryIds: string[];
      allergyTypeIds: string[];
      preferredPriceRange: string;
    },
  ) {
    return this.userService.updatePreferences(user.userId, body);
  }

  @Post('me/onboarding/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '온보딩 완료' })
  async completeOnboarding(@CurrentUser() user: { userId: string }) {
    return this.userService.completeOnboarding(user.userId);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: '프로필 수정' })
  async updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() body: { nickname?: string },
  ) {
    return this.userService.updateProfile(user.userId, body);
  }

  @Put('me/notification')
  @ApiOperation({ summary: '알림 설정 변경' })
  async updateNotification(
    @CurrentUser() user: { userId: string },
    @Body() body: { enabled: boolean; time: string },
  ) {
    return this.userService.updateNotification(user.userId, body);
  }

  @Put('me/push-token')
  @ApiOperation({ summary: '푸시 토큰 등록' })
  async updatePushToken(
    @CurrentUser() user: { userId: string },
    @Body() body: { expoPushToken: string },
  ) {
    return this.userService.updatePushToken(user.userId, body.expoPushToken);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴' })
  async deleteAccount(@CurrentUser() user: { userId: string }) {
    return this.userService.deleteAccount(user.userId);
  }
}
