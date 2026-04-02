import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';

@Controller('users/me')
export class UserController {
  constructor(private userService: UserService) {}

  /** GET /users/me — 내 정보 조회 */
  @Get()
  getMe(@CurrentUser() user: { id: string }) {
    return this.userService.getMe(user.id);
  }

  /** PUT /users/me/location — 회사 위치 설정 */
  @Put('location')
  updateLocation(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateLocationDto,
  ) {
    return this.userService.updateLocation(user.id, dto);
  }

  /** PUT /users/me/preferences — 취향 설정 */
  @Put('preferences')
  updatePreferences(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.userService.updatePreferences(user.id, dto);
  }

  /** POST /users/me/onboarding/complete — 온보딩 완료 */
  @Post('onboarding/complete')
  @HttpCode(HttpStatus.OK)
  completeOnboarding(@CurrentUser() user: { id: string }) {
    return this.userService.completeOnboarding(user.id);
  }

  /** PATCH /users/me/profile — 프로필 수정 */
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  /** PUT /users/me/notification — 알림 설정 */
  @Put('notification')
  updateNotification(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.userService.updateNotification(user.id, dto);
  }

  /** PUT /users/me/push-token — 푸시 토큰 등록 */
  @Put('push-token')
  updatePushToken(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdatePushTokenDto,
  ) {
    return this.userService.updatePushToken(user.id, dto);
  }

  /** DELETE /users/me — 회원 탈퇴 */
  @Delete()
  @HttpCode(HttpStatus.OK)
  deleteMe(@CurrentUser() user: { id: string }) {
    return this.userService.deleteMe(user.id);
  }
}
