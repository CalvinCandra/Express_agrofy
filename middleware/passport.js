import passport from "passport";
import passportJWT from "passport-jwt";

const privateKey =
  "MIICXAIBAAKBgQCZb+m7rqQxTPHRLPR4lY/gCDOVbeymXWFgjhyGbueEW/+ot9WbqkpZpUk6NllvqAS06ff4uRz0LBaUO6vWIgQdy9H+gdIB336Fwccp7gTOCqBeZs7kQkjRXQtxD2emXGbLHrLXYskivA05gp0OOEdDydQReqPoNDKVYIuI9ABzTQIDAQABAoGACowX3A/oN39bjA50C6n0Rukpapcw0krO+80pBtCu13lffKCObXHqRHlJLFg6E6PQFwOSSSWoaNxy/OORL1oNQEeA5w+etq+heQ4KSVgljyQRo/GWiO0R0G8r04gK8ssiO9oLEMV5OQXG4SRvgl18UOSz6YJpwqnWva6tlSQCBf0CQQDoGOBrGNjfiogajC+/jheeXLpshXWEpUts8LkA9AHyiotPqY0KOzzeWw/c26SOUz8OFb2RhkwSV92AkIBNTwmjAkEAqT00j+N6Ws71U9j84m+06OVAk5NVa0GVc8E8PZb/RfHmk5nsJ68599djXVKOmdUyiKsNQfnOKWOjges/HQ0+TwJBAIP+ecqOc/AVYbfvV8xRq971D1ReReos8ws+j4gaPO1Jm1avrzVNYR13njrVcu06LJb/CDM1tBeOfrr58u2EcI8CQFx2oicTI6BFfmfHH7MfUPoFdtiqIHsvI9ZQdvc3blTqqw1thUbRR5yPQyyTlHGbt7ZPrjijoO2gEI9E1gCrYaUCQBoOqbsiKmiqZayJvQZ8UFbWZe0EWIOajPDpqzEZRickjPBPC4ZG8d62pWYmc1M45lHrcGKz9zoj1lJFvx87Jy8="; // private key untuk sign JWT
const ExtractJWT = passportJWT.ExtractJwt;
const StrategyJWT = passportJWT.Strategy;

// Passport strategy untuk JWT
passport.use(
  "internal-rule",
  new StrategyJWT(
    {
      secretOrKey: privateKey,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      passReqToCallback: false,
    },
    (payload, done) => {
      const { name, email, role } = payload;

      // Verifikasi payload yang diterima
      if (!name || !email || !role) {
        return done(null, false); // Token tidak valid
      }

      // Token valid, kirimkan payload ke callback
      return done(null, payload);
    }
  )
);

export default passport;
