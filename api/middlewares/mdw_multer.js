const multer = require('multer');

module.exports = api => {

    api.use(multer({ dest: "imagens/"}).single('avatar'));

};