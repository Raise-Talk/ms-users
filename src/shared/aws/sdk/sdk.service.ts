import { Inject, Injectable } from '@nestjs/common';

import * as AWS from '@aws-sdk/client-cognito-identity-provider';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

@Injectable()
export class AwsSdk {
  readonly clientCognito: AWS.CognitoIdentityProvider;
  readonly userPool: CognitoUserPool;

  constructor(
    @Inject('awsSecrets')
    readonly awsSecrets: string,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: awsSecrets['AWS_COGNITO_USER_POOL_ID'],
      ClientId: awsSecrets['AWS_COGNITO_CLIENT_ID'],
    });

    this.clientCognito = new AWS.CognitoIdentityProvider({
      region: awsSecrets['AWS_CONGNITO_REGION'],
      credentials: {
        accessKeyId: awsSecrets['AWS_ACCESS_KEY_ID'],
        secretAccessKey: awsSecrets['AWS_SECRET_ACCESS_KEY'],
      },
    });
  }
}
