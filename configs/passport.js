const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const mongoose = require('mongoose');

module.exports = () => {

    let Usuario = mongoose.model('Usuario');

    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: '2fd67c1292917ef5184a3429494f6b7f4ab89a195c65'
                + 'f06601aad7ea4e15d2061e89fec85ee9c163a14eb79b3'
                + '08835a8551137cc6a45f0afb4542e5d2f57cef257ffa3d'
                + '2b430777b20473c65b7eda3262ee791e7b119a61aa4990'
                + 'f0d3ad6cbbe54819e1df4dbada4894d10e8de8a4885519a'
                + 'ffa3a0f11617d723ede0d29fc117fbfda5c585a51941552'
                + '0a12521c38e6e07fd92ff70b57b89c741afbbefebdcda88'
                + '557ab3fcf6056a62696840ba2c36320dc5c2a5da82496a7'
                + '272613f05bb2e46883897400c5e0b3b1a3731bb59499f34'
                + '643ea7375b00422893bc15c7b994e246b7e6fda352472de'
                + '60f5ce6dd07b7d433c12c25595b13566562ffde437c15b30f'
    };

    passport.use(new Strategy(opts, (payload, done) => {

        Usuario.findOne({_id: payload._id})
            .then((usuario) => {
                
                if(!usuario) {
                    return done(null, false);
                }
    
                return done(null, usuario);
            }, 
            (error) => {
                return done(error, false);
            });
            
    }));

    return {
        passport: passport,
        secretKey: opts.secretOrKey
    };
};