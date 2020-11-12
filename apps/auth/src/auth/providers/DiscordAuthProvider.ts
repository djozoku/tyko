import cookieParser from 'cookie-parser';
import { Request } from 'express';
import fetch from 'node-fetch';
import { AuthorizationCode, Token } from 'simple-oauth2';

import Account from '../../entities/Account.entity';
import Connection from '../../entities/Connection.entity';
import { BaseAuthProvider } from '../AuthProvider';

const scope = ['identify', 'email'];
const redirect_uri = `${process.env.HOST_ADDRESS}/auth/discord/callback`;
const discordApi = 'https://discord.com/api';

export interface DiscordUserInfo {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export default class DiscordAuthProvider extends BaseAuthProvider {
  constructor() {
    super(
      'Discord',
      new AuthorizationCode({
        client: {
          id: process.env.DISCORD_APP_ID as string,
          secret: process.env.DISCORD_APP_SECRET as string,
        },
        auth: {
          tokenHost: discordApi,
          authorizePath: '/api/oauth2/authorize',
          tokenPath: '/api/oauth2/token',
        },
      }),
    );
  }

  protected registerRoutes(): void {
    this.router.use(cookieParser(process.env.SESSION_SECRET));

    this.router.get('/login', (_req, res) => {
      const state = this.genState();
      const url =
        this.oauth.authorizeURL({
          redirect_uri,
          state,
          scope,
        }) + '&prompt=consent';
      res.cookie('state', state, {
        httpOnly: true,
        maxAge: 1000 * 60 * 5,
        sameSite: 'lax',
      });
      res.redirect(url);
    });

    this.router.get('/callback', async (req, res) => {
      const userState = req.cookies.state;
      const { code, state } = req.query;
      if (userState !== state || !code) {
        res.redirect('/auth/cancel');
        return;
      }

      if (await this.verify(req, code as string)) {
        res.redirect('/auth/loggedin');
      } else {
        res.redirect('/auth/cancel');
      }
    });
  }

  private async verify(req: Request, code: string): Promise<boolean> {
    const token = await this.oauth.getToken({
      redirect_uri,
      scope,
      code,
    });

    try {
      const user = await this.getUserInfo(token.token);

      const id = (req.session?.userId as number) ?? -1;
      const account = await Account.findOne(id);
      console.log(account);
      if (!account) {
        // no account or not logged in
        const connection = await Connection.findOne({ where: { provider_id: user.id } });
        if (!connection) {
          // no account
          return false;
        } else {
          // not logged in
          const account = await Account.findOne({
            where: { id: connection.account_id },
          });

          if (!account) {
            return false;
          }

          connection.token = JSON.stringify(token.token);
          await connection.save();

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          req.session!.userId = account.id;
          return true;
        }
      } else {
        // logged in
        const connection = await Connection.findOne({ where: { provider_id: user.id } });
        if (!connection) {
          // account not connected
          await this.createConnection({
            provider: this.name,
            provider_id: user.id,
            name: user.username,
            email: user.email,
            token: JSON.stringify(token.token),
            avatar: '',
            account_id: account.id,
          });

          return true;
        } else {
          // account connected
          connection.token = JSON.stringify(token.token);
          await connection.save();
          return true;
        }
      }
    } catch (err) {
      req.session?.destroy(() => {
        req.logout();
      });
    }
    return false;
  }

  private async getUserInfo(token: Token): Promise<DiscordUserInfo> {
    const response = await fetch(`${discordApi}/v6/users/@me`, {
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
    });
    const { id, username, avatar, email } = await response.json();
    return {
      id,
      username,
      email,
      avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`,
    };
  }

  private genState(): string {
    const state = [];
    for (let i = 0; i < 32; i++) {
      state.push(Math.floor(Math.random() * 35).toString(36));
    }
    return state.join('');
  }
}
