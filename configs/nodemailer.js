const nodemailer = require('nodemailer');
const Logger = require('./winston');

module.exports = {

    send: (message) => {
        // O primeiro passo é configurar um transporte para este
        // e-mail, precisamos dizer qual servidor será o encarregado
        // por enviá-lo:
        var transporte = nodemailer.createTransport({
        service: 'Gmail', // Como mencionei, vamos usar o Gmail
        auth: {
            user: '', // Basta dizer qual o nosso usuário
            pass: ''             // e a senha da nossa conta
        } 
        });

        var email = {
            from: '', // Quem enviou este e-mail
            to: '', // Quem receberá
            subject: 'Ocorreu algum problema no Scraper da APP HELPER',  // Um assunto bacana :-) 
            html: message // O conteúdo do e-mail
        };

        // Pronto, tudo em mãos, basta informar para o transporte
        // que desejamos enviar este e-mail
        transporte.sendMail(email, function(err, info){
            if(err){
                Logger.error(err);
            }
        
            Logger.info('');
            Logger.info('Email enviado! Leia as informações adicionais: ' + info);
            Logger.info('');
        });
    }

};
// HlpRScRPr@))
