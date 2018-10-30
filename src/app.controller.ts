import { Get, Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('video')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): Promise<string> {
    return this.appService.root();
  }
}
