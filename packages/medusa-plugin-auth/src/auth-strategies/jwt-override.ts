import passport from 'passport';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import { AUTH_TOKEN_COOKIE_NAME } from '../types';

export function loadJwtOverrideStrategy(configModule: ConfigModule): void {
	const { jwt_secret } = configModule.projectConfig;
	passport.use(
		'jwt',
		new JWTStrategy(
			{
				jwtFromRequest: (req) => req.cookies[AUTH_TOKEN_COOKIE_NAME] ?? req.session.jwt,
				secretOrKey: jwt_secret,
			},
			async (jwtPayload, done) => {
				return done(null, jwtPayload);
			}
		)
	);
}
