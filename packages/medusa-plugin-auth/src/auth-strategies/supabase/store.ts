import { MedusaContainer } from '@medusajs/medusa/dist/types/global';

export const SUPABASE_AUTH_ADMIN_STRATEGY_NAME = 'supabase-auth.admin.medusa-auth-plugin';
export const SUPABASE_AUTH_STORE_STRATEGY_NAME = 'supabase-auth.store.medusa-auth-plugin';

export type Profile = { email: string; name?: string };
export type ExtraParams = {
  audience?: string | undefined;
  connection?: string | undefined;
  prompt?: string | undefined;
};

export type SupabaseAuthOptions = {
  supabaseUrl: string;
  supabaseKey: string;
  admin?: {
    callbackUrl: string;
    successRedirect: string;
    failureRedirect: string;
    authPath?: string;
    authCallbackPath?: string;
    verifyCallback?: (
      container: MedusaContainer,
      req: Request,
      accessToken: string,
      refreshToken: string,
      extraParams: ExtraParams,
      profile: Profile,
    ) => Promise<null | { id: string } | never>;
    expiresIn?: number;
  };
  store?: {
    callbackUrl: string;
    successRedirect: string;
    failureRedirect: string;
    authPath?: string;
    authCallbackPath?: string;
    verifyCallback?: (
      container: MedusaContainer,
      req: Request,
      accessToken: string,
      refreshToken: string,
      extraParams: ExtraParams,
      profile: Profile,
    ) => Promise<null | { id: string } | never>;
    expiresIn?: number;
  };
};

import { Router } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { ExtractJwt } from 'passport-jwt';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';

export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  public constructor() {
    super({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      supabaseOptions: {},
      supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(
    container: MedusaContainer,
    req: Request,
    accessToken: string,
    refreshToken: string,
    extraParams: ExtraParams,
    profile: Profile,
  ): Promise<null | { id: string } | never> {
    return super.validate(
      container,
      req,
      accessToken,
      refreshToken,
      extraParams,
      profile,
    );
  }

  authenticate(req) {
    return super.authenticate(req);
  }
}

export function getSupabaseStoreAuthRouter(
  supabase: SupabaseAuthOptions,
  configModule: ConfigModule
): Router {
  return passportAuthRoutesBuilder({
    domain: 'store',
    configModule,
    authPath: supabase.store?.authPath ?? '/store/auth/supabase',
    authCallbackPath: supabase.store?.authCallbackPath ?? '/store/auth/supabase/cb',
    successRedirect: supabase.store.successRedirect,
    strategy: new SupabaseAuthStrategy({
      supabaseUrl: supabase.supabaseUrl,
      supabaseKey: supabase.supabaseKey,
      supabaseOptions: {},
      // callbackURL: supabase.store.callbackUrl,
    }),
    passportAuthenticateMiddlewareOptions: {
      scope: 'openid email profile',
    },
    passportCallbackAuthenticateMiddlewareOptions: {
      failureRedirect: supabase.store.failureRedirect,
    },
    expiresIn: supabase.store.expiresIn,
  });
}
