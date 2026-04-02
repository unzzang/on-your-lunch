import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { ShareService } from './share.service';

@Controller('share')
export class ShareController {
  constructor(private shareService: ShareService) {}

  /** GET /share/restaurant/:id — 딥링크 리다이렉트 [Public] */
  @Public()
  @Get('restaurant/:id')
  shareRestaurant(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const redirectUrl = this.shareService.getRedirectUrl(id, userAgent);
    res.redirect(redirectUrl);
  }
}
