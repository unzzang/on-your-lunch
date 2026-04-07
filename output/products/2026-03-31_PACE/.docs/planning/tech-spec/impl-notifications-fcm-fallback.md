# FCM Fallback API 구현 가이드

> 작성자: 이인수 (백엔드 개발자)
> 작성일: 2026-03-18
> 기준 문서: `planning/tech-spec/backend.md` 7-2절
> 연관 마이그레이션: `planning/erd/migrations/V2__alter_notifications.sql`

---

## 1. 구현 범위

`POST /api/v1/notifications/fcm-fallback-request`

iOS 로컬 알림 슬롯(최대 64개) 부족 시, 복습 알림(NOTI-002-D)을 서버 FCM으로 전환하거나 해제하는 엔드포인트.

---

## 2. 파일 위치

```
src/modules/notifications/
├── notifications.module.ts
├── notifications.controller.ts    ← 엔드포인트 추가 대상
├── notifications.service.ts       ← 비즈니스 로직 추가 대상
├── dto/
│   └── fcm-fallback-request.dto.ts  ← 신규 생성
├── guards/
│   └── device-token.guard.ts        ← 신규 생성 (X-Device-Token 헤더 검증)
└── entities/
    └── device-token.entity.ts       ← is_fcm_fallback_active 컬럼 추가
```

---

## 3. DTO

### `fcm-fallback-request.dto.ts`

```typescript
import { IsBoolean } from 'class-validator';

export class FcmFallbackRequestDto {
  @IsBoolean()
  active: boolean;
}
```

---

## 4. Guard — X-Device-Token 헤더 검증

컨트롤러 레이어에서 헤더 검증 로직을 분리한다. 서비스 레이어 진입 전에 400을 반환하는 것이 목적.

### `device-token.guard.ts`

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class DeviceTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const deviceToken = request.headers['x-device-token'];

    if (!deviceToken || typeof deviceToken !== 'string' || deviceToken.trim() === '') {
      throw new BadRequestException('X-Device-Token 헤더가 누락되었습니다.');
    }

    // 컨트롤러에서 request.deviceToken으로 접근 가능하도록 주입
    request.deviceToken = deviceToken.trim();
    return true;
  }
}
```

---

## 5. Entity 변경

### `device-token.entity.ts` — 컬럼 추가

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('device_tokens')
@Unique(['userId', 'token'])
export class DeviceToken {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({
    type: 'enum',
    enum: ['ios', 'android', 'web'],
  })
  platform: 'ios' | 'android' | 'web';

  // V2 추가 컬럼
  @Column({
    name: 'is_fcm_fallback_active',
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: 'iOS 복습 FCM fallback 활성 여부',
  })
  isFcmFallbackActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

---

## 6. Service

### `notifications.service.ts` — 메서드 추가

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { FcmFallbackRequestDto } from './dto/fcm-fallback-request.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  async updateFcmFallbackActive(
    userId: number,
    fcmToken: string,
    dto: FcmFallbackRequestDto,
  ): Promise<{ fcmFallbackActive: boolean }> {
    // device_tokens WHERE user_id = :userId AND token = :fcmToken 조회
    const deviceToken = await this.deviceTokenRepository.findOne({
      where: { userId, token: fcmToken },
    });

    // 행 미존재 시 404
    if (!deviceToken) {
      throw new NotFoundException('등록된 FCM 토큰을 찾을 수 없습니다.');
    }

    // is_fcm_fallback_active 업데이트
    deviceToken.isFcmFallbackActive = dto.active;
    await this.deviceTokenRepository.save(deviceToken);

    return { fcmFallbackActive: dto.active };
  }
}
```

---

## 7. Controller

### `notifications.controller.ts` — 엔드포인트 추가

```typescript
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FcmFallbackRequestDto } from './dto/fcm-fallback-request.dto';
import { DeviceTokenGuard } from './guards/device-token.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /api/v1/notifications/fcm-fallback-request
   * iOS 로컬 알림 슬롯 한도 초과 시 복습 알림 FCM fallback 등록/해제.
   *
   * 필수 헤더:
   *   Authorization: Bearer {JWT}
   *   X-Device-Token: {fcm_token}
   *
   * 에러:
   *   400 — X-Device-Token 헤더 누락 (DeviceTokenGuard에서 처리)
   *   404 — device_tokens 테이블에 해당 토큰 미존재
   */
  @Post('fcm-fallback-request')
  @UseGuards(DeviceTokenGuard)   // JwtAuthGuard 이후 실행 (Guards 순서 주의)
  @HttpCode(HttpStatus.OK)
  async fcmFallbackRequest(
    @CurrentUser('id') userId: number,
    @Req() req: any,
    @Body() dto: FcmFallbackRequestDto,
  ) {
    // DeviceTokenGuard에서 request.deviceToken에 주입된 값 사용
    const fcmToken: string = req.deviceToken;
    return this.notificationsService.updateFcmFallbackActive(userId, fcmToken, dto);
  }
}
```

---

## 8. 응답 포맷 (response.interceptor.ts 자동 래핑)

### 성공 (HTTP 200)

```json
{
  "success": true,
  "data": { "fcmFallbackActive": true },
  "message": "OK"
}
```

### 에러 — 400 (X-Device-Token 미전달)

```json
{
  "success": false,
  "error": {
    "code": "NOTI_400",
    "message": "X-Device-Token 헤더가 누락되었습니다."
  }
}
```

### 에러 — 404 (토큰 매칭 실패)

```json
{
  "success": false,
  "error": {
    "code": "NOTI_404",
    "message": "등록된 FCM 토큰을 찾을 수 없습니다."
  }
}
```

---

## 9. Guard 실행 순서 주의사항

NestJS `@UseGuards()` 데코레이터는 **선언 순서대로** 실행된다.

```typescript
// 컨트롤러 클래스 레벨에 JwtAuthGuard 전역 적용된 경우
// 메서드 레벨에 DeviceTokenGuard 추가 시 실행 순서:
// 1. JwtAuthGuard (userId 추출)
// 2. DeviceTokenGuard (X-Device-Token 헤더 검증)
```

`JwtAuthGuard`는 `app.module.ts`에서 전역 가드로 등록된 경우 자동 적용. 메서드 레벨에서 `@UseGuards(DeviceTokenGuard)`만 추가하면 된다.

---

## 10. ReviewFcmFallbackJob 연동 포인트

`src/jobs/review-fcm-fallback.job.ts`에서 이 컬럼을 조회 조건으로 사용한다.

```typescript
// 대상 기기 조회 쿼리 (매일 09:00 KST 실행)
const targets = await this.deviceTokenRepository.find({
  where: { isFcmFallbackActive: true },
  relations: ['user'],
});
```

`platform` 컬럼으로 추가 필터링 하지 않는다. 서버는 클라이언트 플랫폼 구분 없이 `is_fcm_fallback_active = 1` 기기에만 FCM 발송. Android 클라이언트는 해당 API를 호출하지 않는 것이 클라이언트 책임.

---

## 11. 구현 체크리스트

- [ ] `V2__alter_notifications.sql` Flyway 마이그레이션 실행 확인
- [ ] `device-token.entity.ts`에 `isFcmFallbackActive` 컬럼 추가
- [ ] `fcm-fallback-request.dto.ts` 생성 (`IsBoolean` 검증)
- [ ] `device-token.guard.ts` 생성 (400 처리)
- [ ] `notifications.service.ts`에 `updateFcmFallbackActive` 메서드 추가
- [ ] `notifications.controller.ts`에 `POST fcm-fallback-request` 엔드포인트 추가
- [ ] Guard 실행 순서 확인 (JwtAuthGuard → DeviceTokenGuard)
- [ ] `ReviewFcmFallbackJob`에서 `isFcmFallbackActive = true` 조건 쿼리 구현
- [ ] 단위 테스트: 정상 케이스(active true/false), 400(헤더 누락), 404(토큰 미존재)
