const Horseman = require('node-horseman');
const Logger = require('../../configs/winston');
const Email = require('../../configs/nodemailer');
const scraperDadosPessoais = require('./Scraper_DadosPessoais');
const scraperHistorico = require('./Scraper_Historico');
const scraperNotas = require('./Scraper_Notas');
const scraperQuadroHorarios = require('./Scraper_QuadroHorarios');
const scraperFaltas = require('./Scraper_Faltas');
const scraperBiblioteca = require('./Scraper_Biblioteca');
const estruturarDados = require('./estruturas/ModeloUsuario');

// @FUNÇAO       - scraper [Promise];
//
// @PARAMETROS   - matricula e password [String];
//
// @FLUXO        - Fluxo Principal Scraper - Main;
//
// @DESCRICAO    - Inicia o processo de extração de dados do cliente que estuda no
//               - Centro Universitario Unipe, acessando o Portal Academico a partir da
//               - da matricula e senha fornecida pelo cliente;
//               - Por meio de uma instancia do Horseman, a pagina do portal é acessada,
//               - e é verificado se a matricula e senha estao corretas,
//               - em seguida a extração é iniciada;
//
// @RETORNO      - Retorna uma Promise, resolve com os dados extraidos ou reject com algum erro;
module.exports = (matricula, senha) => {
    
    return new Promise((resolve, reject) => {    

        let Scraper = {}

        // @CONSTANTE  - horseman;
        //
        // @TIPO       - Promise;
        //
        // @DESCRICAO  - Instancia horseman principal 
        const horseman = new Horseman({
            phantomPath: './node_modules/phantomjs/lib/phantom/bin/phantomjs',
            timeout: 120000,
            loadImages: false,
            diskCache: true
        });



        // @FUNCAO    - verifyAccount [Local];
        //
        // @TIPO      - Void
        //
        // @DESCRICAO - verifica se a matricula e a senha estão corretas;
        //
        // @LOGICA    - Primeiro ela tenta encontrar dentro da pagina que esta sendo acessada,
        //            - algum elemento com o atributo Id #bodyError.
        //            - Se esse elemento for encontrado, significa que a matricula ou senha
        //            - estão erradas, e o fluxo de acesso é encerrado.
        //            - Se o elemento não for encontrado o fluxo de acesso segue normalmente;
        function verifyAccount(){

            horseman
                .do(function(done){

                    Logger.info('Verificando Credencial - ' + matricula + ' - ' + senha );
                    Logger.info('Tentando encontrar elemento na page com Id [ #bodyError ] ');
                    done();
                
                })
                .waitForSelector('#bodyError') // Procurando Elemento
                .then(() => { // Se elemento for encontrado

                    Logger.info('Elemento com Id [#bodyError] encontrado.');
                    Logger.info('Credencial incorreta');
                    reject('Matricula ou senha incorreto');
                    horseman.close();

                })
                .catch((error) => { // Se ocorrer algum problema procurando o elemento

                    var erro = error.message || error;

                    if(erro != 'Phantom Process died'){
                        //Email.send('<h4>Scraper Verify Account Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                    }
                    
                    Logger.info('Credencial Finalizada.');
                });
        };


        // Inicio do fluxo principal a partir da instancia do horseman
        horseman
            .do(function(done) {
                Logger.info('Tentando acessar url: https://academico.unipe.br/Corpore.Net/Main.aspx?ActionID=EduQuadroAvisoActionWeb&SelectedMenuIDKey=mnQuadroAviso');
                done();
            })
            .at('loadFinished', (error) =>{
                console.log(error);
            })
            // acessa pagina do academico
            // .open('https://academico.unipe.br/Corpore.Net/Main.aspx?ActionID=EduQuadroAvisoActionWeb&SelectedMenuIDKey=mnQuadroAviso')
            .open('https://academico.unipe.br/Corpore.Net/Source/Edu-Educacional/RM.EDU.CONTEXTO/EduSelecionarContextoModalWebForm.aspx?Qs=ActionID%3dEduQuadroAvisoActionWeb%26SelectedMenuIDKey%3dmnQuadroAviso')
            .then(function() {
                Logger.info('Url acessada - OK');
            })
            .value('#txtUser', matricula)
            .value('#txtPass', senha)
            .click('#btnLogin')
            // verifica se matricula e senha estao corretas
            .then(verifyAccount)
            .waitForSelector('#grid')
            .click('#grid tr:last-child #rdContexto')
            .then(function() {
                Logger.info('Tentando encontrar elemento na page com Id [#ctl27_gvPercFaltas]');
            })
            .waitForSelector('#ctl27_gvPercFaltas')
            .then(async () => {

                Logger.info('Credencial Correta, acesso permitido');
                Logger.info('Elemento com Id [#ctl27_gvPercFaltas] encontrado.');

                Logger.info('Pronto para executar o scrapper de Faltas')
                await scraperFaltas.run(horseman)
                    .then((dados) => {
                        Scraper['Faltas'] = dados;
                        Logger.info('Scraper Faltas - OK')
                    }).catch((error) => {
                        //Email.send('<h4>Scraper Faltas Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                        Logger.info('');
                        Logger.error('Scraper Faltas - ' + error);    
                        Logger.info('');
                        horseman.close();
                        reject(error);
                    });

                
                Logger.info('Pronto para executar o scrapper de Dados Pessoais')
                await scraperDadosPessoais.run(horseman)
                    .then((dados) => {
                        dados.senha = senha;
                        Scraper['Dados Pessoais'] = dados;
                        Logger.info('Scraper Dados Pessoais - OK')
                    }).catch((error) => {
                        //Email.send('<h4>Scraper Dados Pessoais Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                        Logger.info('');
                        Logger.error('Scraper Dados Pessoais - ' + error);    
                        Logger.info('');
                        horseman.close();
                        reject(error);
                    });

                            
                Logger.info('Pronto para executar o scrapper de Historico')
                await scraperHistorico.run(horseman)
                    .then((dados) => {
                        Scraper['Historico'] = dados;
                        Logger.info('Scraper Historico - OK')
                    }).catch((error) => {
                        //Email.send('<h4>Scraper Historico Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                        Logger.info('');
                        Logger.error('Scraper Historico - ' + error);    
                        Logger.info('');
                        horseman.close();
                        reject(error);
                    });


                Logger.info('Pronto para executar o scrapper de Notas')
                await scraperNotas.run(horseman)
                    .then((dados) => {
                        Scraper['NotasAndFaltas'] = dados;
                        Logger.info('Scraper Notas - OK')
                    }).catch((error) => {
                        //Email.send('<h4>Scraper Historico Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                        Logger.info('');
                        Logger.error('Scraper Notas - ' + error);    
                        Logger.info('');
                        horseman.close();
                        reject(error);
                    });


                Logger.info('Pronto para executar o scrapper de Quadro de Horarios')
                await scraperQuadroHorarios.run(horseman)
                    .then((dados) => {
                        Scraper['Quadro de Horarios'] = dados;   
                        Logger.info('Scraper Quadro de Horarios - OK')
                    }).catch((error) => {
                        //Email.send('<h4>Scraper Quadro de Horarios Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                        Logger.info('');
                        Logger.error('Scraper Quadro de Horarios - ' + error);    
                        Logger.info('');
                        horseman.close();
                        reject(error);
                    });
            
                    
                Logger.info('Pronto para executar o scrapper de Biblioteca')
                await scraperBiblioteca.run(horseman)
                    .then((dados) => {
                        Scraper['Biblioteca'] = dados;
                        Scraper = estruturarDados(Scraper);   
                        horseman.close();
                        resolve(Scraper);
                        Logger.info('Scraper Biblioteca - OK');
                        Logger.info('Scraper Finalizado');
                    }).catch((error) => {
                        //Email.send('<h4>Scraper Biblioteca Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                        Logger.info('');
                        Logger.error('Scraper Biblioteca - ' + error);    
                        Logger.info('');
                        horseman.close();
                        reject(error);
                    });
                    
                horseman.log('finalizou scrapper');
            })
            .catch((error) => {

                var erro = error.message || error;

                if(erro != "Cannot read property 'err' of undefined"){
                    //Email.send('<h4>Scraper Main Erro:</h4><p>' + error + '</p><br><h4>Path:</h4><p>' + __filename + '</p><br>');
                    reject(error);
                    horseman.close();
                }

                Logger.info('');
                Logger.error('Scraper Main - ' + JSON.stringify(error)); 
                Logger.info('');
            });
    })
};

