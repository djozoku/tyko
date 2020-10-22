import { Router } from 'express';
import { AuthorizationCode } from 'simple-oauth2';

import Account from '../entities/Account.entity';
import Connection from '../entities/Connection.entity';
import { IConnection } from '../types/IConnection';

export abstract class BaseAuthProvider {
  constructor(
    public name: string,
    protected oauth: AuthorizationCode,
    public router: Router = Router(),
  ) {
    this.registerRoutes();
  }

  public async updateToken(connection: Connection): Promise<void> {
    const accessToken = this.oauth.createToken(JSON.parse(connection.token));
    if (accessToken.expired()) {
      const newToken = await accessToken.refresh();
      connection.token = JSON.stringify(newToken.token);
      await connection.save();
    }
  }

  protected abstract registerRoutes(): void;

  protected async createAccount(connection: IConnection): Promise<Account> {
    const emailDomain = connection.email.split('@')[1];
    let type = '';
    switch (emailDomain) {
      case process.env.STUDENT_EMAIL_DOMAIN:
        type = 'student';
        break;
      case process.env.TEACHER_EMAIL_DOMAIN:
        type = 'teacher';
        break;
      default:
        throw new Error('Not an allowed email domain');
    }
    const account = await Account.create({
      name: connection.name,
      email: connection.email,
      avatar: connection.avatar,
      type,
    }).save();
    await this.createConnection({
      ...connection,
      account_id: account.id,
    });
    return account;
  }

  protected async createConnection(connection: IConnection): Promise<Connection> {
    return await Connection.create(connection).save();
  }
}
