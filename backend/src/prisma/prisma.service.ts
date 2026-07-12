import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger("PrismaService");
  private isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log("Database connected successfully");
    } catch (error) {
      const isDevelopment = process.env.NODE_ENV === "development";
      if (isDevelopment) {
        this.logger.warn(
          `Database connection failed in development mode: ${
            error instanceof Error ? error.message : String(error)
          }. API will run but database operations will fail.`
        );
        // In development, we allow the app to start without a database
        this.isConnected = false;
      } else {
        // In production, fail fast if database is unavailable
        throw error;
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.isConnected) {
      try {
        await this.$queryRaw`SELECT 1`;
        this.isConnected = true;
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }
}


