import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import aiConfig from '../../config/ai.config';
import { AI_PROVIDER_TOKEN } from './ai.constants';
import { HttpFaceAiProvider, MockFaceAiProvider } from './services';

@Module({
  imports: [ConfigModule.forFeature(aiConfig)],
  providers: [
    MockFaceAiProvider,
    HttpFaceAiProvider,
    {
      provide: AI_PROVIDER_TOKEN,
      inject: [aiConfig.KEY, MockFaceAiProvider, HttpFaceAiProvider],
      useFactory: (
        config: ConfigType<typeof aiConfig>,
        mockProvider: MockFaceAiProvider,
        httpProvider: HttpFaceAiProvider,
      ) => (config.provider === 'http' ? httpProvider : mockProvider),
    },
  ],
  exports: [AI_PROVIDER_TOKEN],
})
export class AiIntegrationModule {}
