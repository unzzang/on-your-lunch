import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserProfileResponseDto, NotificationSettingsDto, UpdatePushTokenDto } from './dto/user-response.dto';

@ApiTags('사용자')
@ApiBearerAuth()
@ApiExtraModels(UserProfileResponseDto, NotificationSettingsDto)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '사용자 프로필. data 필드 안에 반환.', type: UserProfileResponseDto })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.id);
  }

  @Put('me/location')
  @ApiOperation({ summary: '회사 위치 설정' })
  @ApiResponse({ status: 200, description: '위치 저장 성공. data 필드 안에 UserProfile 반환.', type: UserProfileResponseDto })
  updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLocationDto) {
    return this.userService.updateLocation(user.id, dto);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: '음식 선호 설정' })
  @ApiResponse({ status: 200, description: '선호 설정 저장 성공. data 필드 안에 UserProfile 반환.', type: UserProfileResponseDto })
  updatePreferences(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePreferencesDto) {
    return this.userService.updatePreferences(user.id, dto);
  }

  @Post('me/onboarding/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '온보딩 완료 처리' })
  @ApiResponse({ status: 200, description: '온보딩 완료. data 필드 안에 UserProfile 반환.', type: UserProfileResponseDto })
  completeOnboarding(@CurrentUser() user: JwtPayload) {
    return this.userService.completeOnboarding(user.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: '프로필 수정 (닉네임, 프로필 이미지)' })
  @ApiResponse({ status: 200, description: '프로필 수정 성공. data 필드 안에 UserProfile 반환.', type: UserProfileResponseDto })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Get('me/notification')
  @ApiOperation({ summary: '알림 설정 조회' })
  @ApiResponse({ status: 200, description: '알림 설정. data 필드 안에 반환.', type: NotificationSettingsDto })
  getNotification(@CurrentUser() user: JwtPayload) {
    return this.userService.getNotification(user.id);
  }

  @Put('me/notification')
  @ApiOperation({ summary: '알림 설정 변경' })
  @ApiResponse({ status: 200, description: '알림 설정 변경 성공. data 필드 안에 반환.', type: NotificationSettingsDto })
  updateNotification(@CurrentUser() user: JwtPayload, @Body() dto: UpdateNotificationDto) {
    return this.userService.updateNotification(user.id, dto);
  }

  @Put('me/push-token')
  @ApiOperation({ summary: 'Expo 푸시 토큰 등록' })
  @ApiResponse({ status: 200, description: '푸시 토큰 저장 성공. data 필드 안에 { message: "저장 완료" } 반환.' })
  updatePushToken(@CurrentUser() user: JwtPayload, @Body() body: UpdatePushTokenDto) {
    return this.userService.updatePushToken(user.id, body.expoPushToken);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '계정 삭제 성공 (소프트 삭제). data 필드 안에 { message: "탈퇴 완료" } 반환.' })
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.userService.deleteAccount(user.id);
  }
}
