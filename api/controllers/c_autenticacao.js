const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = api => {
    
    let Usuario = mongoose.model('Usuario');
    let jwt = api.middlewares.mdw_passport;

    let ControlerAutenticacao = {

        login: (req, res) => {
            
            let matricula = req.body.matricula;
            let senha = req.body.senha;


            if(!matricula || !senha)
               return res.send('matricula ou senha incorretas');

            Usuario
                .findOne({cursos: { $elemMatch: {'id_curso.registro_academico': matricula }}})
                .then((usuario) => {
                   
                    if(!usuario)
                        return res.send('matricula ou senha incorretas');

                       
                    let senhaCrypt = usuario.cursos.map(curso => {
                        
                        if(curso.id_curso.registro_academico == matricula) {
                            return curso.id_curso.senha;
                        }
                        
                    }).toString();
                    
                  
                    bcrypt.compare(senha, senhaCrypt, (error, decoded) => {
                     
                        if(!decoded)
                            return res.send('matricula ou senha incorretas');

                        let token = jwt.generateToken({_id: usuario._id});
                        return res.status(201).send({usuario: usuario, token: token});
                    });

                },
                (error) => {
                    return res.send('Ocorreu um problema ao tentar acessar, tente novamente.');
                });
        }
    };

    return ControlerAutenticacao;
} 
