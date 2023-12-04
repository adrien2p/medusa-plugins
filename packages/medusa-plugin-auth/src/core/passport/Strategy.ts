import passport from 'passport';

type Type<T> = new (...args: any[]) => T;

export function PassportStrategy<T extends Type<any> = any>(
	Strategy: T,
	name?: string | undefined
): {
	new (...args): InstanceType<T>;
} {
	abstract class MixinStrategy extends Strategy {
		protected constructor(...args: any[]) {
			const callback = async (...params: any[]) => {
				const done = params.pop();

				try {
					const validateResult = await this.validate(...params);
					done(null, validateResult);
				} catch (err) {
					done(null, null, { msg: err.message });
				}
			};

			super(...args, callback);

			const passportInstance = this.getPassportInstance();
			if (name) {
				passportInstance.use(name, this as any);
			} else {
				passportInstance.use(this as any);
			}
		}

		abstract validate(...args: any[]): any;

		getPassportInstance() {
			return passport;
		}
	}

	return MixinStrategy;
}
