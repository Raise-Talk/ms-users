import { Injectable } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService {
  async get(secretName: string) {
    const client = new SecretsManagerClient({
      region: 'us-east-1',
    });

    try {
      let secrets = await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
        }),
      );

      secrets = JSON.parse(secrets.SecretString);

      return secrets;
    } catch (error) {
      throw error;
    }
  }
}
