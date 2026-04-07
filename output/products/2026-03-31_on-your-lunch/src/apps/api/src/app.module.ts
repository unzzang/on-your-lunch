import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { UserModule } from './user/user.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { EatingHistoryModule } from './eating-history/eating-history.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ShareModule } from './share/share.module';
import { NotificationModule } from './notification/notification.module';
import { EventModule } from './event/event.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CategoryModule,
    UserModule,
    RestaurantModule,
    RecommendationModule,
    EatingHistoryModule,
    FavoriteModule,
    ShareModule,
    NotificationModule,
    EventModule,
  ],
})
export class AppModule {}
