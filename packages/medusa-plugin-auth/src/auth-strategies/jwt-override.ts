import passport from 'passport';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, STORE_AUTH_TOKEN_COOKIE_NAME } from '../types';

export function loadJwtOverrideStrategy(configModule: ConfigModule): void {
	const { jwt_secret } = configModule.projectConfig;

	passport.use(
		'admin-jwt',
		new JWTStrategy(
			{
				jwtFromRequest: (req) => {
					return req.cookies[ADMIN_AUTH_TOKEN_COOKIE_NAME] ?? req.session.jwt;
				},
				secretOrKey: jwt_secret,
			},
			async (jwtPayload, done) => {
				return done(null, jwtPayload);
			}
		)
	);

	passport.use(
		'store-jwt',
		new JWTStrategy(
			{
				jwtFromRequest: (req) => {
					return req.cookies[STORE_AUTH_TOKEN_COOKIE_NAME] ?? req.session.jwt_store;
				},
				secretOrKey: jwt_secret,
			},
			async (jwtPayload, done) => {
				return done(null, jwtPayload);
			}
		)
	);
}
