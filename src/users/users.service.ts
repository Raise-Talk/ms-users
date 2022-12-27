import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { AwsSdk } from 'src/shared/aws/sdk/sdk.service';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService extends AwsSdk {
  async me(accessToken: string) {
    const params = {
      AccessToken: accessToken,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .getUser(params)
        .then((res) => {
          const usersAttr: any = res.UserAttributes.reduce(
            (result, { Name, Value }) => {
              return { ...result, [Name]: Value };
            },
            {},
          );

          resolve(new HttpException(usersAttr, HttpStatus.OK));
        })

        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async list() {
    const params = {
      UserPoolId: this.awsSecrets['AWS_COGNITO_USER_POOL_ID'],
      AttributesToGet: ['name', 'email'],
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .listUsers(params)
        .then((res) => {
          const users = res.Users.map((user) => {
            const userAttr = Object.entries(user.Attributes).reduce(
              (previusValue, currentValue) => {
                const [key, { Name: name, Value: value }] = previusValue;
                const [key2, { Name: name2, Value: value2 }] = currentValue;

                return Object.assign({ [name]: value, [name2]: value2 });
              },
            );

            delete user.Attributes;

            return { ...userAttr, ...user };
          });

          resolve(new HttpException(users, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async create({ name, email, password }: CreateUserDto) {
    const params = {
      ClientId: this.awsSecrets['AWS_COGNITO_CLIENT_ID'],
      Password: password,
      Username: email,

      UserAttributes: [
        {
          Name: 'name',
          Value: name,
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .signUp(params)
        .then((res) => {
          const params = {
            GroupName: 'real_state_broker',
            UserPoolId: this.awsSecrets['AWS_COGNITO_USER_POOL_ID'],
            Username: email,
          };

          this.clientCognito
            .adminAddUserToGroup(params)
            .then((res) => {
              resolve(new HttpException(res.$metadata, HttpStatus.OK));
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

  async update({ access_token, ...updateUserDto }: UpdateUserDto) {
    const UserAttributes = Object.entries(updateUserDto).map(
      ([_key, _value]) => ({
        Name: _key,
        Value: _value,
      }),
    );

    const params = {
      AccessToken: access_token,
      UserAttributes,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .updateUserAttributes(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }

  async delete({ email }: DeleteUserDto) {
    const params = {
      UserPoolId: this.awsSecrets['AWS_COGNITO_USER_POOL_ID'],
      Username: email,
    };

    return new Promise((resolve, reject) => {
      this.clientCognito
        .adminDeleteUser(params)
        .then((res) => {
          resolve(new HttpException(res, HttpStatus.OK));
        })
        .catch((err) => {
          reject(new HttpException(err.message, HttpStatus.BAD_REQUEST));
        });
    });
  }
}
