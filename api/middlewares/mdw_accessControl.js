module.exports = api => {

    return {
        
        accessControl: (req, res, done) => {

            let matricula = req.body.matricula;
            let senha = req.body.senha;
            
            // @VARIAVEL  - matriculaOcupada;
            //
            // @TIPO      - Boolean;
            //
            // @LOGICA    - Se a matricula estiver inserida
            //            - no Array de controle [Matriculas];
            //
            // @DESCRICAO - Verifica se a matricula está inserida na Array de controle
            //            - indicando que a matricula está sendo usada naquele momento
            let matriculaOcupada = api.get('Matriculas').includes(matricula);

            if(matriculaOcupada)
                return res.send('Matricula sendo usada');

            else if (!matricula || !senha)
                return res.send('matricula ou senha incorretas');
            
            else {

                api.set('Matriculas', api.get('Matriculas').concat(matricula));
                return done();
            };
        },

        remover: (matricula) =>{
            api.set('Matriculas', api.get('Matriculas').filter(elemento => elemento != matricula));
        }
    }
};