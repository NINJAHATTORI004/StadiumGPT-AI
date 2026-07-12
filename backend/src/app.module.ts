import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { CacheModule } from "@nestjs/cache-manager";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { OperationsModule } from "./operations/operations.module";
import { AiModule } from "./ai/ai.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "development" 
        ? ".env.development" 
        : ".env"
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30_000
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    // Note: BullModule commented out for development without Redis
    // Uncomment when Redis is available in production
    // BullModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     connection: {
    //       url: config.get<string>("REDIS_URL") ?? "redis://localhost:6379"
    //     }
    //   })
    // }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OperationsModule,
    AiModule,
    NotificationsModule,
    AnalyticsModule,
    HealthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
