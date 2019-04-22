const cloudinary = require('cloudinary');

module.exports = () => {

    cloudinary.config({ 
        cloud_name: 'helpi', 
        api_key: '', 
        api_secret: '' 
    });

    return cloudinary;
};
