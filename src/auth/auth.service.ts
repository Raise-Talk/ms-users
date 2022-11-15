import {
  assignMetadata,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LogoutUserDto } from './dto/logout-user.dto';
import { ResendAccountCodeDto } from './dto/resend-account-code.dto';
import { SecretsService } from '../shared/aws/secrets/secrets.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;

  constructor(
    private secretService: SecretsService,
    @Inject('awsSecrets')
    private readonly awsSecrets: string,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: awsSecrets['AWS_COGNITO_USER_POOL_ID'],
      ClientId: awsSecrets['AWS_COGNITO_CLIENT_ID'],
    });
  }

  async authenticateUser({ email, password }: LoginUserDto) {
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userCognito = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      userCognito.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const accessAuth = {
            idToken: result.getIdToken().getJwtToken(),
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          };

          resolve(
            new Promise(function (resolve, reject) {
              userCognito.getUserAttributes((err, result) => {
                if (err)
                  reject(
                    new HttpException(err.message, HttpStatus.BAD_REQUEST),
                  );

                const user_data = JSON.parse(JSON.stringify(result)).reduce(
                  (obj, item) =>
                    Object.assign(obj, { [item.Name]: item.Value }),
                  {},
                );

                resolve(
                  new HttpException(
                    Object.assign(accessAuth, user_data),
                    HttpStatus.OK,
                  ),
                );
              });
            }),
          );
        },
        onFailure: (err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        },
      });
    });
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          return reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        },
      });
    });
  }

  async confirmPassword({ email, code, newPassword }: ConfirmPasswordDto) {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: (result) => {
          resolve(new HttpException(result, HttpStatus.OK));
        },
        onFailure: (err) => {
          return reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        },
      });
    });
  }

  async confirmAccount({ email, code }: ConfirmAccountDto) {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          return reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        }

        resolve(new HttpException(result, HttpStatus.OK));
      });
    });
  }

  async resendAccountCode({ email }: ResendAccountCodeDto) {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          return reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        }

        resolve(new HttpException(result, HttpStatus.OK));
      });
    });
  }

  async confirmEmail({ email, password, code }: ConfirmEmailDto) {
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userCognito = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      userCognito.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(
            new Promise(function (resolve, reject) {
              userCognito.verifyAttribute('email', code, {
                onSuccess: (result) => {
                  resolve(new HttpException(result, HttpStatus.OK));
                },
                onFailure: (err) => {
                  reject(
                    new HttpException(err.message, HttpStatus.BAD_REQUEST),
                  );
                },
              });
            }),
          );
        },
        onFailure: (err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        },
      });
    });
  }

  async logout({ email }: LogoutUserDto) {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    try {
      cognitoUser.signOut();
      return new HttpException('ok', HttpStatus.OK);
    } catch (error) {
      return new HttpException(error, HttpStatus.OK);
    }
  }
}
