import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../types';
export declare function loadGoogleAdminStrategy(container: MedusaContainer, configModule: ConfigModule, google: AuthOptions['google']): void;
export declare function getGoogleAdminAuthRouter(google: AuthOptions['google'], configModule: ConfigModule): Router;
export declare function loadGoogleStoreStrategy(container: MedusaContainer, configModule: ConfigModule, google: AuthOptions['google']): void;
export declare function getGoogleStoreAuthRouter(google: AuthOptions['google'], configModule: ConfigModule): Router;
//# sourceMappingURL=google.d.ts.map