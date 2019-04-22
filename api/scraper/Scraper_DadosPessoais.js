const Logger = require('../../configs/winston');

module.exports = {
    
    // @METODO       - run;
    //
    // @TIPO         - Promise;
    //
    // @PARAMETRO    - A Instancia do Horseman do fluxo principal;
    //
    // @FLUXO        - Fluxo Secundario Scraper - Dados Pessoais;
    //
    // @DESCRICAO    - Após o acesso ao portal academico feito pelo fluxo principal,
    //               - aqui é feito um redirecionamento, indo para a pagina de Dados Pessoais
    //               - onde é iniciado a extração dos dados referentes a os dados do usuario;
    //
    // @RETORNO      - Retorna uma Promise, resolve com os dados pessoais extraidos ou reject com algum erro;
    run: (horseman) => { 

        return new Promise((resolve, reject) => {

            Logger.info('Iniciando scraper de Dados Pessoais');

            // Inicio do fluxo secundario Dados Pessoais a partir da instancia horseman principal
            horseman
                .do((done) => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl11_ctl00_tvAccordionContents_ctl00_ctl02__CaptionCell ] ');
                    done();
                })
                // Aguardando a tag [li] com a tag link [a] que redireciona para Dados pessoais
                .waitForSelector('#ctl12_ctl00_tvAccordionContents_ctl00_ctl01__CaptionCell')
                .then(() => {
                    Logger.info('Elemento com Id [#ctl12_ctl00_tvAccordionContents_ctl00_ctl01__CaptionCell] encontrado.');
                })
                .click('#ctl12_ctl00_tvAccordionContents_ctl00_ctl01__CaptionCell > a')
                .then(() => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #MainTable ] ');
                })
                // Aguardando id do elemento principal
                .waitForSelector('#MainTable')
                .then(() => {
                    Logger.info('Elemento com Id [#MainTable] encontrado.');
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl27_ctl03_xpnlDadosPessoais_fvDadosAluno_xpgcDadosPessoais_C0 ] ');
                })
                // Aguardando id do elemento que contem as informaçoes
                .waitForSelector('#ctl27_ctl03_xpnlDadosPessoais_fvDadosAluno_xpgcDadosPessoais_C0')
                .then(() => {
                    Logger.info('Elemento com Id [#ctl27_ctl03_xpnlDadosPessoais_fvDadosAluno_xpgcDadosPessoais_C0] encontrado.');
                    Logger.info('Extraindo dados...');
                })
                .evaluate(function(){
                                
                    var dadosPessoais = {};
                    
                    // @VARIAVEL  - inputsTableDadosPessoais;
                    //
                    // @TIPO      - Array[input];
                    //
                    // @DESCRICAO - Inputs com os dados do usuario
                    var inputsTableDadosPessoais = $('#ctl27_ctl03_xpnlDadosPessoais_fvDadosAluno_xpgcDadosPessoais_C0 > div > table > tbody input');
                    var estado = $('#ctl27_ctl03_xpnlDadosPessoais_fvDadosAluno_xpgcDadosPessoais_xcbEstado');
                        estado = estado
                                    .find('option:selected')
                                    .text()
                                    .trim();

                    inputsTableDadosPessoais.each(function(){

                        var input = $(this);

                        // @VARIAVEL  - labelOpc1;
                        //
                        // @TIPO      - String;
                        //
                        // @DESCRICAO - Primeira opcão de label do input retirando [*] e espaços em branco das pontas
                        var labelOpc1 = input.siblings('span').text()
                                            .replace(/\*/g, '')
                                            .trim();
                        
                        // @VARIAVEL  - labelOpc2;
                        //
                        // @TIPO      - String;
                        //
                        // @DESCRICAO - Segunda opção de label do input
                        var labelOpc2 = input.parent().siblings('span').text();
                       
                        // @VARIAVEL  - nomeDado;
                        //
                        // @TIPO      - String;
                        //
                        // @DESCRICAO - Nome definitivo escolhido a partir das duas opçoes de label.
                        //
                        // @LOGICA    - Sempre priorizando a labelOpc1, se estiver vazia, a labelOpc2 é escolhida;
                        var nomeDado = labelOpc1 || labelOpc2;
                        
                        var valorDado = input.val();

                        dadosPessoais[nomeDado] = valorDado;
                    });

                    dadosPessoais["Estado"] = estado;

                    return dadosPessoais;
                })
                .then((scraperDadosPessoais) => {
                    return resolve(scraperDadosPessoais);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }
}