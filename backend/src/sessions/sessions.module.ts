import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
