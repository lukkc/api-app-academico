const api = require('./configs/express')();
const mongoDB = require('./configs/mongoose');
const PORT = process.env.PORT || 3000;

// module.exports = { 

    // run: () => {
        
        mongoDB.connect();
        
        api.listen(PORT, () => {
            console.log('SERVER API HELPI - ' + PORT);
        });
    // }
    
// };
