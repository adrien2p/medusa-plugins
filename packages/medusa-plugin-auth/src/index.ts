/**
 * Noop passport session in order to delayed the usage of it after the custom auth strategies have been applied
 */
import passport from 'passport';

export const originalPassportSession = passport.session;
passport.session = () => () => void 0;
