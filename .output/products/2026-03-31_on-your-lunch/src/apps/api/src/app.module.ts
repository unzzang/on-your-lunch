import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { EatingHistoryModule } from './eating-history/eating-history.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ShareModule } from './share/share.module';
import { NotificationModule } from './notification/notification.module';
import { CategoryModule } from './category/category.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    // 환경변수 설정 — 전역 적용
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 스케줄러 (푸시 알림용)
    ScheduleModule.forRoot(),

    // 내부 모듈
    PrismaModule,
    AuthModule,
    UserModule,
    RestaurantModule,
    RecommendationModule,
    EatingHistoryModule,
    FavoriteModule,
    ShareModule,
    NotificationModule,
    CategoryModule,
    EventModule,
  ],
})
export class AppModule {}
