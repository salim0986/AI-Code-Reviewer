import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { loginHistory } from '../database/schema';
import { eq, and, desc, ne } from 'drizzle-orm';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  async trackLogin(
    userId: string,
    ipAddress: string,
    userAgent: string,
    email: string,
  ): Promise<void> {
    try {
      // Get the last login from a different IP address
      const [lastDifferentLogin] = await this.databaseService.db
        .select()
        .from(loginHistory)
        .where(and(eq(loginHistory.userId, userId), ne(loginHistory.ipAddress, ipAddress)))
        .orderBy(desc(loginHistory.loginAt))
        .limit(1);

      // Check if this is a new device/location
      const shouldNotify = this.shouldSendLoginNotification(
        lastDifferentLogin,
        ipAddress,
      );

      // Record this login
      const [newLoginRecord] = await this.databaseService.db
        .insert(loginHistory)
        .values({
          userId,
          ipAddress,
          userAgent,
          wasNotified: shouldNotify,
        })
        .returning();

      // Send notification if it's an unusual login
      if (shouldNotify) {
        await this.emailService.sendLoginNotification(email, {
          ipAddress,
          userAgent,
          timestamp: newLoginRecord.loginAt,
        });
        this.logger.log(
          `Login notification sent to ${email} for unusual activity`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error tracking login for user ${userId}`,
        error.stack,
      );
      // Don't throw - login tracking failure shouldn't block the login
    }
  }

  private shouldSendLoginNotification(
    lastLogin: any,
    currentIpAddress: string,
  ): boolean {
    if (!lastLogin) {
      // First login from any device - don't send notification
      return false;
    }

    // Check if the last login was from a different IP
    const isDifferentIp = lastLogin.ipAddress !== currentIpAddress;

    // Check if the last login was more than 7 days ago
    const lastLoginDate = new Date(lastLogin.loginAt);
    const daysSinceLastLogin =
      (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
    const wasLongTimeAgo = daysSinceLastLogin > 7;

    // Send notification if logging in from a different IP and haven't logged in for a while
    return isDifferentIp && wasLongTimeAgo;
  }
}
