import { Injectable } from '@nestjs/common';
import { SecretsService } from './shared/aws/secrets/secrets.service';

@Injectable()
export class AppService {
  constructor(private secretService: SecretsService) {}

  getPublic(): string {
    return 'where is public';
  }

  getPrivate(): Object {
    const result = this.secretService.get('prod/cognito/pool');

    return result;
  }
}
