const Logger = require('../../configs/winston');

module.exports = {

    // @METODO       - run;
    //
    // @TIPO         - Promise;
    //
    // @PARAMETRO    - A Instancia do Horseman do fluxo principal;
    //
    // @FLUXO        - Fluxo Secundario Scraper - Historico;
    //
    // @DESCRICAO    - Após o acesso ao portal academico feito pelo fluxo principal,
    //               - aqui é feito um redirecionamento, indo para a pagina de Historico
    //               - onde é iniciado a extração dos dados;
    //
    // @RETORNO      - Retorna uma Promise, resolve com os dados extraidos ou reject com algum erro;
    run: (horseman) => { 
        
        return new Promise((resolve, reject) => {

            Logger.info('Iniciando scraper de Notas');

            // Inicio do fluxo secundario a partir da instacia horseman principal
            horseman
                .do((done) => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl12_ctl00_tvAccordionContents_ctl00_ctl03__CaptionCell ] ');
                    done();
                })
                // Aguardando a tag [li] com a tag link [a] que redireciona para historico
                .waitForSelector('#ctl12_ctl00_tvAccordionContents_ctl00_ctl03__CaptionCell')
                .then(() => {
                    Logger.info('Elemento com Id [ #ctl12_ctl00_tvAccordionContents_ctl00_ctl03__CaptionCell ] encontrado.');
                })
                .click('#ctl12_ctl00_tvAccordionContents_ctl00_ctl03__CaptionCell > a')
                .then(() => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl27_xgvNotasFilial_DXMainTable ] ');
                })
                // Aguardando id do elemento principal que contem as informaçoes
                .waitForSelector('#ctl27_xgvNotasFilial_DXMainTable')
                .then(() => {
                    Logger.info('Elemento com Id [ #ctl27_xgvNotasFilial_DXMainTable ] encontrado.');
                    Logger.info('Extraindo dados...');
                })
                .evaluate(function(){
                            
                    var Notas = [];
                    var Faltas = [];

                    // @VARIAVEL  - tdsTableHistorico;
                    //
                    // @TIPO      - Array[<td>];
                    //
                    // @DESCRICAO - tds com os dados da tabela do historico;
                    var trsTableNotas = $('#ctl27_xgvNotasFilial_DXMainTable > tbody > tr:not(:first):not(:first)');
                    
        
                    trsTableNotas.each(function(){
                     
                        var tr = $(this);
                        var tds = tr.find('td');

                        
                        var NotasDisciplina = {
                            disciplina: tds.eq(3).text().trim(),
                            media_geral: tds.eq(5).text().trim(),
                            estagio1: {
                                estagio: tds.eq(6).text().trim(),
                                mediaEstagio: tds.eq(11).text().trim(),
                                presencial: tds.eq(7).text().trim(),
                                semiPresencial: tds.eq(9).text().trim()
                            },
                            estagio2: {
                                estagio: tds.eq(8).text().trim(),
                                mediaEstagio: tds.eq(16).text().trim(),
                                presencial: tds.eq(13).text().trim(),
                                semiPresencial: tds.eq(15).text().trim()
                            },
                            estagio3: {
                                estagio: tds.eq(10).text().trim(),
                                mediaEstagio: tds.eq(19).text().trim(),
                                presencial: tds.eq(17).text().trim(),
                                semiPresencial: tds.eq(18).text().trim()
                            }
                        }

                        Notas.push(NotasDisciplina);
                    });

                    var trsTableFaltas = $('#ctl27_xgvFaltasFilial_DXMainTable > tbody > tr:not(:first):not(:first)');
                    
        
                    trsTableFaltas.each(function(){
                     
                        var tr = $(this);
                        var tds = tr.find('td');

                        
                        var faltasDisciplina = {
                            disciplina: tds.eq(3).text(),
                            faltas: tds.eq(5).text(), 
                        }

                        Faltas.push(faltasDisciplina);
                    });

                    return {Faltas: Faltas, Notas: Notas};
                        
                })
                .then((dados) => {
                                
                    return resolve(dados);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }
};