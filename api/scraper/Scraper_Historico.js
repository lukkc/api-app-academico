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

            Logger.info('Iniciando scraper de Historico');

            // Inicio do fluxo secundario a partir da instacia horseman principal
            horseman
                .do((done) => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl12_ctl00_tvAccordionContents_ctl00_ctl02__CaptionCell ] ');
                    done();
                })
                // Aguardando a tag [li] com a tag link [a] que redireciona para historico
                .waitForSelector('#ctl12_ctl00_tvAccordionContents_ctl00_ctl02__CaptionCell')
                .then(() => {
                    Logger.info('Elemento com Id [#ctl12_ctl00_tvAccordionContents_ctl00_ctl02__CaptionCell] encontrado.');
                })
                .click('#ctl12_ctl00_tvAccordionContents_ctl00_ctl02__CaptionCell > a')
                .then(() => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl27_ctl03_fvHistorico_gvHistorico ] ');
                })
                // Aguardando id do elemento principal que contem as informaçoes
                .waitForSelector('#ctl27_ctl03_fvHistorico_gvHistorico')
                .then(() => {
                    Logger.info('Elemento com Id [#ctl27_ctl03_fvHistorico_gvHistorico] encontrado.');
                    Logger.info('Extraindo dados...');
                })
                .evaluate(function(){
                            
                    var Curso = {}
                    var historico = [];
                    var InformacaoCurso = {};

                    // @VARIAVEL  - tdsTableHistorico;
                    //
                    // @TIPO      - Array[<td>];
                    //
                    // @DESCRICAO - tds com os dados da tabela do historico;
                    var tdsTableHistorico = $('#ctl27_ctl03_fvHistorico_gvHistorico tr:not(:first) td');
                    
                    // @VARIAVEL  - inputsTableCurso;
                    //
                    // @TIPO      - Array[<input>];
                    //
                    // @DESCRICAO - inputs com dados da tabela com as informaçoes sobre o curso;
                    var inputsTableCurso = $('#ctl27_ctl03_fvHistorico > tbody > tr > td > table:nth-child(2) input');
                    var periodoLetivo = $('#ctl27_ctl03_ctl00_xrpContextoEducacional_lbPeriodo').text(); 

                    InformacaoCurso['periodo_letivo'] = periodoLetivo;

                    // Incio extração dados curso;
                    inputsTableCurso.each(function() {

                        var input = $(this)
                        var name = input.siblings('span').text();
                        var valor = input.val();

                        InformacaoCurso[name] = valor;
                    });

                    Curso['InfoCurso'] = InformacaoCurso;
                    // Fim extração dados curso;

                    // Inicio extração dados historico
                    tdsTableHistorico.each(function(){
                     
                        var td = $(this);

                        // @VARIAVEL  - valorTd;
                        //
                        // @TIPO      - String;
                        //
                        // @DESCRICAO - Valor da td alvo retirando espaços em branco das pontas;
                        var valorTd = td.text()
                                        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                        
                        // @VARIAVEL  - isDisciplina;
                        //
                        // @TIPO      - Boolean;
                        //
                        // @DESCRICAO - Verifica se a td alvo tem a classe [WrapedText];
                        var isDisciplina = td.find('div').hasClass('WrapedText');
                        
                        // @VARIAVEL  - tdImgAttrSrc;
                        //
                        // @TIPO      - String;
                        //
                        // @DESCRICAO - Valor do atributo src da img com dado de status;
                        //
                        // @LOGICA    - Verifica se a td alvo tem um filho img e tenta
                        //            - pegar o valor do seu atributo src. Se diferente 
                        //            - de String o valor é definido como branco;
                        var tdImgAttrSrc = td.children('img').attr('src') || '';
                        
                        // @DESCRICAO - Verifica o valor da td, para não permitir extrair
                        //            - valor indesejavel;
                        //
                        // @LOGICA    - Se o valor da td é diferente de [**], faça;
                        if(valorTd != '**'){

                            // @DESCRICAO - Verifica se o valor da td é uma disciplina, 
                            //            - e concatena com uma palavra chave, para ser facil
                            //            - identificar dentro da Array Historico;
                            //
                            // @LOGICA    - Se o valor da td é uma disciplina,
                            //            - concatena o valor com [DSCP] e adiciona na Array;
                            //            - Senão, apenas adiciona o valor na Array;
                            if(isDisciplina)
                                historico.push(valorTd + 'DSCP');
                            
                            else  
                                historico.push(valorTd);
                        }
                      
                        
                        // @DESCRICAO - Verifica se o valor do atributo src da img tem
                        //            - a String [naoconcluida], para identificar se a disciplina 
                        //            - não foi concluida.
                        //            - Senão se, verifica se o valor do atributo tem a String
                        //            - [concluida], para identificar se a disciplina foi concluida.
                        //            - Senão se, verifica se o valor do atributo tem a String
                        //            - [pendente], para identificar se a disciplina está pendente.
                        //            - Senão se, verifica se o valor do atributo tem a String
                        //            - [equivalente], para identificar se a disciplina é equivalente.
                        if(/naoconcluida/i.test(tdImgAttrSrc))  
                            historico.push('não concluido');
                        
                        else if(/concluida/i.test(tdImgAttrSrc))
                            historico.push('concluido');
                        
                        else if(/pendente/i.test(tdImgAttrSrc))
                            historico.push('pendente');

                        else if(/equivalente/i.test(tdImgAttrSrc))
                            historico.push('equivalente');

                    });

                    Curso['historico'] = historico;

                    return Curso;
                        
                })
                .then((dados) => {
                 
                    let Historico = [];
                    let disciplinas = [];
                    
                    // @VARIAVEL  - dadosHistorico;
                    //
                    // @TIPO      - Array[String];
                    //
                    // @DESCRICAO - Uma instancia da Array de historico;
                    let dadosHistorico = dados.historico;
                    
                    // @VARIAVEL  - auxDadosHistorico;
                    //
                    // @TIPO      - Array[String];
                    //
                    // @DESCRICAO - Uma instancia auxiliar da Array de historico;
                    let auxDadosHistorico = dados.historico;

                    dadosHistorico.forEach((elementHistorico, indexElementHistorico) => {

                        // @DESCRICAO - Verifica se o elemento alvo tem a String [Período ou Periodo];
                        if(/(Período|Periodo)/i.test(elementHistorico)) {

                            let periodo = elementHistorico
                                    .replace(/(Período|Periodo)/, '')
                                    .replace(/\s/, '')
                                    .toLowerCase();
                            let disciplinas = [];

                            // @VARIAVEL  - stop;
                            //
                            // @TIPO      - Boolean;
                            //
                            // @DESCRICAO - Uma flag para o controle de filtragem do Array. 
                            let stop = false;

                            // @VARIAVEL  - dadosPeriodo;
                            //
                            // @TIPO      - Array[String]
                            //
                            // @DESCRICAO - Uma nova Array com os dados do historico é gerada passando por um filtro
                            //            - deixando apenas os dados referentes as disciplinas;
                            let dadosPeriodo = auxDadosHistorico.filter((elementPeriodo, indexElementPeriodo) => {

                                    // @VARIAVEL  - indexMenor_filtro1;
                                    //
                                    // @TIPO      - Boolean;
                                    //
                                    // @DESCRICAO - Verifica se o indice do elemento[indexElementPeriodo] no loop do Array
                                    //            - auxiliar [auxDadosHistorico] é menor do que o indice do elemento[indexElementHistorico]
                                    //            - no loop do Array principal [dadosHistorico];
                                    let indexMenor = indexElementPeriodo < indexElementHistorico;

                                    // @VARIAVEL  - indexMaior_filtro2;
                                    //
                                    // @TIPO      - Boolean;
                                    //
                                    // @DESCRICAO - Verifica se o indice do elemento[indexElementPeriodo] no loop do Array
                                    //            - auxiliar [auxDadosHistorico] é maior do que o indice do elemento[indexElementHistorico]
                                    //            - no loop do Array principal [dadosHistorico];
                                    let indexMaior = indexElementPeriodo > indexElementHistorico;

                                    // @VARIAVEL  - isPeriodo_filtro3;
                                    //
                                    // @TIPO      - Boolean;
                                    //
                                    // @DESCRICAO - Verifica se o elemento[elementPeriodo] no loop do Array
                                    //            - auxiliar [auxDadosHistorico] tem a String [Período ou Periodo];
                                    let isPeriodo = /(Período|Periodo)/i.test(elementPeriodo);

                                    // @VARIAVEL  - isDisciplinaEquivalente_filtro4;
                                    //
                                    // @TIPO      - Boolean;
                                    //
                                    // @DESCRICAO - Verifica se o elemento[elementPeriodo] no loop do Array
                                    //            - auxiliar [auxDadosHistorico] tem a String [Disciplinas equivalentes];
                                    let isDisciplinaEquivalente = /Disciplinas equivalentes/i.test(elementPeriodo);
                                
                                    // @LOGICA - Se algum filtro for verdadeiro, a variavel de controle[stop]
                                    //         - recebe o valor [true];
                                    if( indexMenor || (indexMaior && isPeriodo) || isDisciplinaEquivalente ){
                                        stop = true;
                                    } 
                                    // @LOGICA - Se o indice do elemento[indexElementPeriodo] no loop do Array
                                    //         - auxiliar [auxDadosHistorico] for igual ao do indice do elemento[indexElementHistorico]
                                    //         - no loop do Array principal [dadosHistorico], a variavel de controle[stop],
                                    //         - recebe o valor [false] e a função de filtro recebe o retorno [false], indicando que o
                                    //         - elemento alvo deve ser descartado;
                                    else if ( indexElementPeriodo == indexElementHistorico ){
                                        stop = false;
                                        return false;
                                    }

                                    // @LOGICA - Se a variavel de controle[stop] for [true], 
                                    //         - a função de filtro recebe o retorno [false], indicando que o
                                    //         - elemento alvo deve ser descartado;
                                    if(stop) {
                                        return false;
                                    }  

                                    // A função de filtro recebe o retorno [true], indicando que o
                                    // elemento alvo deve ser adicionado no novo Array;
                                    return true;
                            });

                            // @VARIAVEL  - auxDadosPeriodo;
                            //
                            // @TIPO      - Array[String]
                            //
                            // @DESCRICAO - Array auxiliar com os dados filtrados de historico, copia de [dadosPeriodo];
                            let auxDadosPeriodo = dadosPeriodo;

                            dadosPeriodo.forEach((elementPeriodo, indexElementPeriodo) => {

                                // @VARIAVEL  - isDisciplina;
                                //
                                // @TIPO      - Boolean;
                                //
                                // @DESCRICAO - Verifica se o elemento[elementPeriodo] no loop do Array
                                //            - [dadosPeriodo] tem a String [DSCP], indicando que é uma disciplina;
                                let isDisciplina = /DSCP/i.test(elementPeriodo);
                                

                                if(isDisciplina) {

                                    // obtem a disciplina e retira a String [DSCP];
                                    var disciplina = elementPeriodo.replace(/DSCP/, '');
                                    var indexDisciplina = indexElementPeriodo;
                                    var stop = false;

                                    // @VARIAVEL  - dadosDisciplina;
                                    //
                                    // @TIPO      - Array[String]
                                    //
                                    // @DESCRICAO - Uma nova Array com os dados do historico de uma disciplina especifica é 
                                    //            - gerada;
                                    var dadosDisciplina = auxDadosPeriodo.filter((elementDisciplina, indexElementDisciplina) => {

                                        // @LOGICA - Se o indice do elemento[indexElementDisciplina] no loop do Array
                                        //         - auxiliar [auxDadosPeriodo] for menor do que o indice do elemento[indexDisciplina]
                                        //         - no loop do Array principal [dadosPeriodo], a variavel de controle[stop],
                                        //         - recebe o valor [true];
                                        if(indexElementDisciplina < indexDisciplina){
                                            stop = true;
                                        } 
                                        // @LOGICA - Senão se, o elemento[elementDisciplina] no loop do Array
                                        //         - auxiliar [auxDadosPeriodo] for uma disciplina e o indice do elemento[indexElementDisciplina]
                                        //         - no loop do Array auxiliar [auxDadosPeriodo] for maior do que o indice do elemento[indexDisciplina]
                                        //         - no loop do Array principal [dadosPeriodo], a variavel de controle[stop],
                                        //         - recebe o valor [true];
                                        else if (/DSCP/i.test(elementDisciplina) && indexElementDisciplina > indexDisciplina){
                                            stop = true;
                                        } 
                                        // @LOGICA - Se o indice do elemento[indexElementDisciplina] no loop do Array
                                        //         - auxiliar [auxDadosPeriodo] for igual ao do indice do elemento[indexDisciplina]
                                        //         - no loop do Array principal [dadosPeriodo], a variavel de controle[stop],
                                        //         - recebe o valor [false];
                                        else if ( indexElementDisciplina == indexDisciplina ){
                                            stop = false;
                                            return false;
                                        }


                                        if(stop) {
                                            return false;
                                        }  

                                        return true;
                                    });//fim filter auxDadosPeriodo
                                   
                                    
                                    disciplinas.push({
                                        nome: disciplina,
                                        situcao: dadosDisciplina[0],
                                        periodo_letivo: dadosDisciplina[1],
                                        media_notas: dadosDisciplina[3],
                                        fatas: dadosDisciplina[4],
                                        credito: dadosDisciplina[5],
                                        ch: dadosDisciplina[6],
                                        status: dadosDisciplina[8]
                                    });
                                }; //fim if isDisciplina
                            });//fim each dadosPeriodo
                            

                            Historico.push({
                                periodo: periodo,
                                disciplinas: disciplinas  
                            });


                        };//fim if isPeriodo
                    });//fim each dadosHistorico

                    return resolve({info: dados.InfoCurso, periodos: Historico});
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }
};