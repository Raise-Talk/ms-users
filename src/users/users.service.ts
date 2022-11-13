import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { SecretsService } from 'src/shared/aws/secrets/secrets.service';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
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

  async create({ name, email, password }: CreateUserDto) {
    const nameAttribute = new CognitoUserAttribute({
      Name: 'name',
      Value: name,
    });

    const emailAttribute = new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    });

    return new Promise((resolve, reject) =>
      this.userPool.signUp(
        email,
        password,
        [emailAttribute, nameAttribute],
        null,
        (err, result) => {
          if (err) {
            reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
          } else {
            resolve(result);
          }
        },
      ),
    );
  }

  async update({ name, email, password, newEmail }: UpdateUserDto) {
    const newEmailInCognito = new CognitoUserAttribute({
      Name: 'email',
      Value: newEmail,
    });

    const newNameInCognito = new CognitoUserAttribute({
      Name: 'name',
      Value: name,
    });

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
              userCognito.updateAttributes(
                [newNameInCognito, newEmailInCognito],
                (err, result) => {
                  if (err)
                    reject(
                      new HttpException(err.message, HttpStatus.BAD_REQUEST),
                    );
                  resolve(new HttpException(result, HttpStatus.OK));
                },
              );
            }),
          );
        },
        onFailure: (err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        },
      });
    });
  }

  async delete({ email }: DeleteUserDto) {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.deleteUser((err, result) => {
        if (err) {
          return reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        }

        resolve(new HttpException(result, HttpStatus.OK));
      });
    });
  }
}
