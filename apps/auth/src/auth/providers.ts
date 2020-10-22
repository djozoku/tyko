import { BaseAuthProvider } from './AuthProvider';
import DiscordAuthProvider from './providers/DiscordAuthProvider';
import MicrosoftAuthProvider from './providers/MicrosoftAuthProvider';

export const providers: BaseAuthProvider[] = [];

if (process.env.MICROSOFT_AUTH_ENABLE === 'true') providers.push(new MicrosoftAuthProvider());
if (process.env.DISCORD_AUTH_ENABLE === 'true') providers.push(new DiscordAuthProvider());
