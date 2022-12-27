import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

import * as AWS from '@aws-sdk/client-cognito-identity-provider';

import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LogoutUserDto } from './dto/logout-user.dto';
import { ResendAccountCodeDto } from './dto/resend-account-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { AwsSdk } from 'src/shared/aws/sdk/sdk.service';

@Injectable()
export class AuthService extends AwsSdk {
  async authenticateUser({ email, password }: LoginUserDto) {
    const params = {
      AuthFlow: this.awsSecrets['AWS_COGNITO_AUTH_FLOW'],
      ClientId: this.awsSecrets['AWS_COGNITO_CLIENT_ID'],
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .initiateAuth(params)
        .then((response) => {
          const params = {
            AccessToken: response.AuthenticationResult.AccessToken,
          };

          this.clientCognito
            .getUser(params)
            .then((res) => {
              const usersAttr: any = res.UserAttributes.reduce(
                (result, { Name, Value }) => {
                  return { ...result, [Name]: Value };
                },
                {},
              );

              resolve(
                new HttpException(
                  { ...usersAttr, ...response.AuthenticationResult },
                  HttpStatus.OK,
                ),
              );
            })

            .catch((err) => {
              reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
            });
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const params = {
      ClientId: this.awsSecrets['AWS_COGNITO_CLIENT_ID'],
      Username: email,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .forgotPassword(params)
        .then((res) => {
          resolve(new HttpException(res.CodeDeliveryDetails, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async confirmForgotPassword({
    email,
    code,
    newPassword,
  }: ConfirmPasswordDto) {
    const params = {
      ClientId: this.awsSecrets['AWS_COGNITO_CLIENT_ID'],
      ConfirmationCode: code,
      Password: newPassword,
      Username: email,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .confirmForgotPassword(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async confirmAccount({ email, code }: ConfirmAccountDto) {
    const params = {
      ClientId: this.awsSecrets['AWS_COGNITO_CLIENT_ID'],
      ConfirmationCode: code,
      Username: email,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .confirmSignUp(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async resendAccountCode({ email }: ResendAccountCodeDto) {
    const params = {
      ClientId: this.awsSecrets['AWS_COGNITO_CLIENT_ID'],
      Username: email,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .resendConfirmationCode(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async confirmEmail({ email, access_token, code }: ConfirmEmailDto) {
    const params = {
      AccessToken: access_token,
      AttributeName: 'email',
      Code: code,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .verifyUserAttribute(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async logout({ access_token }: LogoutUserDto) {
    const params = {
      AccessToken: access_token,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .globalSignOut(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }
}
