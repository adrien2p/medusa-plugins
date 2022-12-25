import passport from 'passport';

type Type<T> = new (...args: any[]) => T;

export function PassportStrategy<T extends Type<any> = any>(
	Strategy: T,
	name?: string | undefined
): {
	new (...args): InstanceType<T>;
} {
	abstract class MixinStrategy extends Strategy {
		AUTH_PROVIDER_NAME: string;

		abstract validate(...args: any[]): any;

		protected constructor(...args: any[]) {
			const callback = async (...params: any[]) => {
				const done = params.pop();

				try {
					const validateResult = await this.validate(...params);
					done(null, validateResult);
				} catch (err) {
					done(err, null);
				}
			};

			super(...args, callback);

			this.AUTH_PROVIDER_NAME = name;

			const passportInstance = this.getPassportInstance();
			if (name) {
				passportInstance.use(name, this as any);
			} else {
				passportInstance.use(this as any);
			}
		}

		getPassportInstance() {
			return passport;
		}
	}
	return MixinStrategy;
}
