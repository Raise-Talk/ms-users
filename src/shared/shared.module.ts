import { FactoryProvider, Global, Module } from '@nestjs/common';
import { SecretsService } from './aws/secrets/secrets.service';

const secretProviders: FactoryProvider<unknown> = {
  inject: [SecretsService],
  provide: 'awsSecrets',
  useFactory: async (secretService: SecretsService) => {
    const secrets = await secretService.get('prod/cognito/pool');
    return secrets;
  },
};

@Global()
@Module({
  providers: [SecretsService, secretProviders],
  exports: [SecretsService, secretProviders],
})
export class SharedModule {}
