const jwt = require('jsonwebtoken');
const { passport, secretKey } = require('../../configs/passport')();

module.exports = api => {
    
    api.use(passport.initialize());

    return {

        authenticate: passport.authenticate('jwt', { session: false }),
        
        generateToken: (params) => {
            return jwt.sign(params, secretKey, {
                expiresIn: 86400
            });
        },
    };
};