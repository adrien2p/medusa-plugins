"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleStoreAuthRouter = exports.loadGoogleStoreStrategy = exports.getGoogleAdminAuthRouter = exports.loadGoogleAdminStrategy = void 0;
const passport_1 = __importDefault(require("passport"));
const express_1 = require("express");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_google_oauth2_1 = require("passport-google-oauth2");
const format_registration_name_1 = __importDefault(require("@medusajs/medusa/dist/utils/format-registration-name"));
const medusa_core_utils_1 = require("medusa-core-utils");
const utils_1 = require("@medusajs/medusa/dist/utils");
const GOOGLE_ADMIN_STRATEGY = 'google.admin';
const GOOGLE_STORE_STRATEGY = 'google.store';
function loadGoogleAdminStrategy(container, configModule, google) {
    const userService = container.resolve((0, format_registration_name_1.default)(`${process.cwd()}/services/user.js`));
    const METADATA_KEY = 'useGoogleStrategy';
    passport_1.default.serializeUser(function (user, done) {
        done(null, user);
    });
    passport_1.default.deserializeUser(function (user, done) {
        done(null, user);
    });
    passport_1.default.use(GOOGLE_ADMIN_STRATEGY, new passport_google_oauth2_1.Strategy({
        clientID: google.clientID,
        clientSecret: google.clientSecret,
        callbackURL: google.admin.callbackUrl,
        passReqToCallback: true,
    }, async function (req, accessToken, refreshToken, profile, done) {
        var _a, _b, _c;
        const email = profile.emails[0].value;
        const user = await userService.retrieveByEmail(email).catch(() => void 0);
        if (user) {
            if (!user.metadata[METADATA_KEY]) {
                const err = new medusa_core_utils_1.MedusaError(medusa_core_utils_1.MedusaError.Types.INVALID_DATA, `User with email ${email} already exists`);
                return done(err, null);
            }
            else {
                req.session.jwt = jsonwebtoken_1.default.sign({ userId: user.id }, configModule.projectConfig.jwt_secret, {
                    expiresIn: (_a = google.admin.expiresIn) !== null && _a !== void 0 ? _a : "24h",
                });
                return done(null, { id: user.id });
            }
        }
        await userService
            .create({
            email,
            metadata: {
                [METADATA_KEY]: true,
            },
            first_name: (_b = profile === null || profile === void 0 ? void 0 : profile.name.givenName) !== null && _b !== void 0 ? _b : '',
            last_name: (_c = profile === null || profile === void 0 ? void 0 : profile.name.familyName) !== null && _c !== void 0 ? _c : '',
        }, (0, utils_1.generateEntityId)('temp_pass_'))
            .then((user) => {
            req.session.jwt = jsonwebtoken_1.default.sign({ userId: user.id }, configModule.projectConfig.jwt_secret, {
                expiresIn: '24h',
            });
            return done(null, { id: user.id });
        })
            .catch((err) => {
            return done(err, null);
        });
    }));
}
exports.loadGoogleAdminStrategy = loadGoogleAdminStrategy;
function getGoogleAdminAuthRouter(google, configModule) {
    const router = (0, express_1.Router)();
    const adminCorsOptions = {
        origin: configModule.projectConfig.admin_cors.split(','),
        credentials: true,
    };
    router.get(google.admin.authPath, (0, cors_1.default)(adminCorsOptions));
    router.get(google.admin.authPath, passport_1.default.authenticate(GOOGLE_ADMIN_STRATEGY, {
        scope: ['email', 'profile'],
    }));
    router.get(google.admin.authCallbackPath, (0, cors_1.default)(adminCorsOptions));
    router.get(google.admin.authCallbackPath, passport_1.default.authenticate(GOOGLE_ADMIN_STRATEGY, {
        failureRedirect: google.admin.failureRedirect,
        successRedirect: google.admin.successRedirect,
    }));
    return router;
}
exports.getGoogleAdminAuthRouter = getGoogleAdminAuthRouter;
function loadGoogleStoreStrategy(container, configModule, google) {
    const manager = container.resolve('manager');
    const customerService = container.resolve((0, format_registration_name_1.default)(`${process.cwd()}/services/customer.js`));
    const METADATA_KEY = 'useGoogleStrategy';
    passport_1.default.serializeUser(function (user, done) {
        done(null, user);
    });
    passport_1.default.deserializeUser(function (user, done) {
        done(null, user);
    });
    passport_1.default.use(GOOGLE_STORE_STRATEGY, new passport_google_oauth2_1.Strategy({
        clientID: google.clientID,
        clientSecret: google.clientSecret,
        callbackURL: google.store.callbackUrl,
        passReqToCallback: true,
    }, async function (req, accessToken, refreshToken, profile, done) {
        await manager.transaction(async (transactionManager) => {
            var _a, _b;
            const email = profile.emails[0].value;
            const customer = await customerService
                .withTransaction(transactionManager)
                .retrieveByEmail(email)
                .catch(() => void 0);
            if (customer) {
                if (!customer.metadata[METADATA_KEY]) {
                    const err = new medusa_core_utils_1.MedusaError(medusa_core_utils_1.MedusaError.Types.INVALID_DATA, `Customer with email ${email} already exists`);
                    return done(err, null);
                }
                else {
                    req.session.jwt = jsonwebtoken_1.default.sign({ customer_id: customer.id }, configModule.projectConfig.jwt_secret, {
                        expiresIn: '24h',
                    });
                    return done(null, { customer_id: customer.id });
                }
            }
            await customerService
                .withTransaction(transactionManager)
                .create({
                email,
                metadata: {
                    [METADATA_KEY]: true,
                },
                first_name: (_a = profile === null || profile === void 0 ? void 0 : profile.name.givenName) !== null && _a !== void 0 ? _a : '',
                last_name: (_b = profile === null || profile === void 0 ? void 0 : profile.name.familyName) !== null && _b !== void 0 ? _b : '',
            })
                .then((user) => {
                var _a;
                req.session.jwt = jsonwebtoken_1.default.sign({ userId: user.id }, configModule.projectConfig.jwt_secret, {
                    expiresIn: (_a = google.admin.expiresIn) !== null && _a !== void 0 ? _a : "30d",
                });
                return done(null, { id: user.id });
            })
                .catch((err) => {
                return done(err, null);
            });
        });
    }));
}
exports.loadGoogleStoreStrategy = loadGoogleStoreStrategy;
function getGoogleStoreAuthRouter(google, configModule) {
    const router = (0, express_1.Router)();
    const adminCorsOptions = {
        origin: configModule.projectConfig.store_cors.split(','),
        credentials: true,
    };
    router.get(google.store.authPath, (0, cors_1.default)(adminCorsOptions));
    router.get(google.store.authPath, passport_1.default.authenticate(GOOGLE_ADMIN_STRATEGY, {
        scope: ['email', 'profile'],
    }));
    router.get(google.store.authCallbackPath, (0, cors_1.default)(adminCorsOptions));
    router.get(google.store.authCallbackPath, passport_1.default.authenticate(GOOGLE_ADMIN_STRATEGY, {
        failureRedirect: google.store.failureRedirect,
        successRedirect: google.store.successRedirect,
    }));
    return router;
}
exports.getGoogleStoreAuthRouter = getGoogleStoreAuthRouter;
//# sourceMappingURL=google.js.map