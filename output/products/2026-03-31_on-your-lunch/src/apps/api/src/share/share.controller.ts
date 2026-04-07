import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { ShareService } from './share.service';
import { Public } from '../auth/decorators/public.decorator';
import { ShareLinkResponseDto } from './dto/share-response.dto';

@ApiTags('공유')
@ApiExtraModels(ShareLinkResponseDto)
@Controller('share')
export class ShareController {
  constructor(private shareService: ShareService) {}

  @Public()
  @Get('restaurant/:id')
  @ApiOperation({ summary: '식당 공유 링크 생성' })
  @ApiResponse({ status: 200, description: '공유 URL. data 필드 안에 반환.', type: ShareLinkResponseDto })
  @ApiResponse({ status: 404, description: '식당을 찾을 수 없음' })
  getShareLink(@Param('id') id: string) {
    return this.shareService.getShareLink(id);
  }
}
