import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() → 이 모듈을 앱 전체에서 사용 가능하게 함.
// 다른 모듈에서 imports에 PrismaModule을 추가하지 않아도
// PrismaService를 주입받을 수 있음.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
