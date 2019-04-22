const mongoose = require('mongoose');

module.exports = {

    connect: () => {

        const db = mongoose.connection;
        const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/helpi';

        mongoose.set('useCreateIndex', true);
        mongoose.connect(mongodbUri, {
            useNewUrlParser: true
        });

        db.on('connected', () =>{
            console.log('CONECTADO AO MONGODB');
        });

        db.on('error', (error) =>{
            console.log('Erro na conexão com MongoDB: ' + error);
        });

        db.on('disconnected', () =>{
            console.log('Desconectado do MongoDB');
        });

        process.on('SIGINT', () => {

            db.close(() => {
                console.log('Conexão fechada pelo término da aplicação.');
                process.exit(0);
            });

        });
    }
};