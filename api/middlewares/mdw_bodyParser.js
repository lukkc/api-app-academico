const bodyParser = require('body-parser');

module.exports = api => {

    api.use(bodyParser.json());
    api.use(bodyParser.urlencoded({extended: false}));

};