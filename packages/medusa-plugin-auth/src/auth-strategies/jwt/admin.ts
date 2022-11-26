import { PassportStrategy } from '../../core/Strategy';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { JWT_ADMIN_STRATEGY_NAME } from './types';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME } from '../../types';

export class JwtAdminStrategy extends PassportStrategy(JWTStrategy, JWT_ADMIN_STRATEGY_NAME) {
	constructor(protected readonly container: MedusaContainer, protected readonly configModule: ConfigModule) {
		const { jwt_secret } = configModule.projectConfig;
		super({
			jwtFromRequest: (req) => {
				return req.cookies[ADMIN_AUTH_TOKEN_COOKIE_NAME] ?? req.session.jwt;
			},
			secretOrKey: jwt_secret,
		});
	}

	async validate(jwtPayload): Promise<any> {
		return jwtPayload;
	}
}
