const express = require('express');
const consign = require('consign');

module.exports = () => {

    let api = express();

    api.set('json spaces', 3);

    // Array de controle Matriculas;
    api.set('Matriculas', []);

    consign({cwd: 'api'})
        .include('middlewares/mdw_cors.js')
        .then('middlewares/mdw_bodyParser.js')
        .then('middlewares/mdw_multer.js')
        .then('middlewares/mdw_accessControl.js')
        .then('models')
        .then('middlewares/mdw_passport.js')
        .then('controllers')
        .then('routes')
        .into(api);


    return api;
}