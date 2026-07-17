import "reflect-metadata";
import compression from "compression";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { SanitizeInterceptor } from "./common/interceptors/sanitize.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const origin = config.get<string>("CORS_ORIGIN") ?? "http://localhost:3000,http://127.0.0.1:3100,http://localhost:3100";

  app.setGlobalPrefix("api");
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: origin.split(",").map((value) => value.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new SanitizeInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("StadiumGPT AI API")
    .setDescription("Smart stadium operations API for FIFA World Cup 2026 venues.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true }
  });

  const port = Number(config.get("API_PORT") ?? 4000);
  await app.listen(port);
}

void bootstrap();
