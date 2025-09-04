import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FIX REWARD API')
    .setDescription('FIX REWARD API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'accessToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const custom: SwaggerCustomOptions = {
    customSiteTitle: 'FIX REWARD API',
    swaggerOptions: {
      defaultModelsExpandDepth: 0,
      defaultModelExpandDepth: 5,
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup('doc', app, document, custom);
}
