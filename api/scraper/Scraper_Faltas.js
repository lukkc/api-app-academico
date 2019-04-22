const Logger = require('../../configs/winston');

module.exports = {

    // @METODO       - run;
    //
    // @TIPO         - Promise;
    //
    // @PARAMETRO    - A Instancia do Horseman do fluxo principal;
    //
    // @FLUXO        - Fluxo Secundario Scraper - Faltas;
    //
    // @DESCRICAO    - Após o acesso ao portal academico feito pelo fluxo principal,
    //               - aqui é feito um redirecionamento, indo para a pagina de Quadro de avisos
    //               - onde é iniciado a extração dos dados referente as faltas atuais do semestre;
    //
    // @RETORNO      - Retorna uma Promise, resolve com os dados das faltas extraidos ou reject com algum erro;
    run: (horseman) => { 
        
        return new Promise((resolve, reject) => {
            
            Logger.info('Iniciando scraper de Faltas');

            // Inicio do fluxo secundario Faltas a partir da instancia horseman principal
            horseman
                .do((done) => {
                    Logger.info('Extraindo dados...');
                    done();
                })
                .evaluate(function() {

                    var faltasPorDisciplina =[];

                    // @VARIAVEL  - trsTableFaltas;
                    //
                    // @TIPO      - Array[tr]
                    //
                    // @DESCRICAO - trs da tabela de faltas;
                    var trsTableFaltas = $('#ctl27_gvPercFaltas > tbody > tr:not(:first-child)');
                    
                    trsTableFaltas.each(function(){

                        var tr = $(this);

                        // @VARIAVEL  - tds;
                        //
                        // @TIPO      - Array[<td>];
                        //
                        // @DESCRICAO - todas as tds visiveis da tr alvo;
                        var tds = tr.find('td:not(:hidden)');
                        var disciplina = tds.eq(3).text().trim();
                        var faltas = tds.eq(5).text();

                        faltasPorDisciplina.push({
                            disciplina: disciplina,
                            valor: faltas
                        });
                    });
            
                    return faltasPorDisciplina; 
                })
                .then((scraperFaltas) => {  
                    console.log(scraperFaltas)
                    return resolve(scraperFaltas);
                }).catch((error) => {
                    return reject(error);
                });
        });
    }
};