import 'isomorphic-fetch';
import passport from 'passport';
import { Request } from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import { Client } from '@microsoft/microsoft-graph-client';
import { IProfile, OIDCStrategy, VerifyCallback } from 'passport-azure-ad';

import { BaseAuthProvider } from '../AuthProvider';
import { isDev } from '../../constants';
import Account from '../../entities/Account.entity';
import Connection from '../../entities/Connection.entity';

interface MicrosoftUserDetails {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName: string;
}

type Verify = (
  req: Request,
  iss: string,
  sub: string,
  profile: IProfile,
  access_token: string,
  refresh_token: string,
  params: any,
  done: VerifyCallback,
) => Promise<void>;

export default class MicrosoftAuthProvider extends BaseAuthProvider {
  constructor() {
    super(
      'Microsoft',
      new AuthorizationCode({
        client: {
          id: process.env.MICROSOFT_APP_ID as string,
          secret: process.env.MICROSOFT_APP_SECRET as string,
        },
        auth: {
          tokenHost: process.env.MICROSOFT_AUTHORITY as string,
          authorizePath: 'oauth2/v2.0/authorize',
          tokenPath: 'oauth2/v2.0/token',
        },
      }),
    );

    passport.use(
      new OIDCStrategy(
        {
          identityMetadata: `${process.env.MICROSOFT_AUTHORITY}v2.0/.well-known/openid-configuration`,
          clientID: process.env.MICROSOFT_APP_ID as string,
          responseType: 'code id_token',
          responseMode: 'form_post',
          redirectUrl: `${process.env.HOST_ADDRESS}/auth/microsoft/callback`,
          allowHttpForRedirectUrl: isDev,
          clientSecret: process.env.MICROSOFT_APP_SECRET as string,
          validateIssuer: !isDev,
          passReqToCallback: true,
          scope: ['email', 'profile', 'offline_access', 'User.read', 'openid'],
          loggingLevel: 'info',
        },
        this.verify(),
      ),
    );
  }

  private verify(): Verify {
    return async (req, _iss, _sub, _profile, accessToken, _refreshToken, params, done) => {
      try {
        const user = await this.getUserDetails(accessToken);

        // Create a simple-oauth2 token from raw tokens
        const oauthToken = this.oauth.createToken(params);

        const id = (req.session?.userId as number) ?? -1;
        const account = await Account.findOne(id);
        if (!account) {
          // no account or not logged in
          const connection = await Connection.findOne({ where: { provider_id: user.id } });
          if (!connection) {
            // no account
            const account = await this.createAccount({
              provider: this.name,
              provider_id: user.id,
              name: user.displayName ?? '',
              email: user.mail || user.userPrincipalName,
              token: JSON.stringify(oauthToken.token),
              avatar: '',
              account_id: -1,
            });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            req.session!.userId = account.id;
            return done(null, account);
          } else {
            // not logged in
            const account = await Account.findOne({
              where: { id: connection.account_id },
            });

            if (!account) {
              return done(new Error('Error logging in'));
            }

            connection.token = JSON.stringify(oauthToken.token);
            await connection.save();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            req.session!.userId = account.id;
            return done(null, account);
          }
        } else {
          // logged in
          const connection = await Connection.findOne({ where: { provider_id: user.id } });
          if (!connection) {
            // account not connected
            await this.createConnection({
              provider: this.name,
              provider_id: user.id,
              name: user.displayName ?? '',
              email: user.mail || user.userPrincipalName,
              token: JSON.stringify(oauthToken.token),
              avatar: '',
              account_id: account.id,
            });

            return done(null, account);
          } else {
            // account connected
            connection.token = JSON.stringify(oauthToken.token);
            await connection.save();
            return done(null, account);
          }
        }
      } catch (err) {
        req.session?.destroy(() => {
          req.logout();
          done(err);
        });
      }
    };
  }

  private getAuthenticatedClient(accessToken: string): Client {
    // Initialize Graph client
    const client = Client.init({
      // Use the provided access token to authenticate
      // requests
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    return client;
  }

  // TODO: get user photo
  private async getUserDetails(accessToken: string): Promise<MicrosoftUserDetails> {
    const client = this.getAuthenticatedClient(accessToken);

    const user = (await client.api('/me').get()) as MicrosoftUserDetails;
    let photo;
    try {
      photo = await client.api('/me/photo/$value').get();
    } catch (err) {
      console.log(err);
    }
    console.log(photo);
    return user;
  }

  protected registerRoutes(): void {
    this.router.get('/login', (req, res, next) => {
      passport.authenticate('azuread-openidconnect', {
        prompt: 'login',
        failureRedirect: '/auth/cancel',
      })(req, res, next);
    });

    this.router.post('/callback', (req, res, next) => {
      passport.authenticate('azuread-openidconnect', {
        successRedirect: '/auth/loggedin',
        failureRedirect: '/auth/cancel',
      })(req, res, next);
    });
  }
}
