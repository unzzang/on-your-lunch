import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ShareService } from './share.service';

@ApiTags('공유')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get('restaurant/:id')
  @ApiOperation({ summary: '딥링크 리다이렉트 (카카오톡 공유)' })
  async redirectToRestaurant(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.shareService.getRedirectUrl(id, req.headers['user-agent'] || '');
    return res.redirect(redirectUrl);
  }
}
