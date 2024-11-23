import passport from "passport";
import passportJWT from "passport-jwt";

const privateKey = "c89f025c-4179-4d92-882a-f3114c63e027"; // private key untuk sign JWT
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
