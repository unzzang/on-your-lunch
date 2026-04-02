import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { EatingHistoryModule } from './eating-history/eating-history.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ShareModule } from './share/share.module';
import { NotificationModule } from './notification/notification.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),    // @Cron 데코레이터 활성화
    PrismaModule,                // DB 연결 — 모든 모듈이 사용
    AuthModule,                  // 인증 (Google OAuth, JWT) — 전역 Guard 포함
    CategoryModule,              // 마스터 데이터 (카테고리, 알레르기)
    UserModule,                  // 사용자 (프로필, 위치, 취향)
    RestaurantModule,            // 식당 (CRUD, 검색, 지도)
    RecommendationModule,        // 추천 (알고리즘, 새로고침)
    EatingHistoryModule,         // 먹은 이력 (기록, 캘린더)
    FavoriteModule,              // 즐겨찾기
    ShareModule,                 // 공유 (딥링크)
    NotificationModule,          // 푸시 알림 (스케줄)
    EventModule,                 // 이벤트 로그
  ],
})
export class AppModule {}
