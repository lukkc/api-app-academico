const Logger = require('../../configs/winston');

module.exports = {

    // @METODO       - run;
    //
    // @TIPO         - Promise;
    //
    // @PARAMETRO    - A Instancia do Horseman do fluxo principal;
    //
    // @FLUXO        - Fluxo Secundario Scraper - Quadro de Horarios;
    //
    // @DESCRICAO    - Após o acesso ao portal academico feito pelo fluxo principal,
    //               - aqui é feito um redirecionamento, indo para a pagina de Quadro de Horarios
    //               - onde é iniciado a extração dos dados;
    //
    // @RETORNO      - Retorna uma Promise, resolve com os dados extraidos ou reject com algum erro;
    run: (horseman) => { 
        
        return new Promise((resolve, reject) => {

            Logger.info('Iniciando scraper de Quadro de Horarios');
        
            // Inicio do fluxo secundario a partir da instacia horseman principal 
            horseman
                .do((done) => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl12_ctl00_tvAccordionContents_ctl00_ctl05__CaptionCell ] ');
                    done();
                })
                // Aguardando a tag [li] com a tag link [a] que redireciona para Quadro de horarios
                .waitForSelector('#ctl12_ctl00_tvAccordionContents_ctl00_ctl05__CaptionCell')
                .then(() => {
                    Logger.info('Elemento com Id [ #ctl12_ctl00_tvAccordionContents_ctl00_ctl05__CaptionCell ] encontrado.');
                })
                .click('#ctl12_ctl00_tvAccordionContents_ctl00_ctl05__CaptionCell > a')
                .then(() => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #divQuadroHorario ] ');
                })
                // Aguardando id do elemento principal que contem as informaçoes
                .waitForSelector('#divQuadroHorario')
                .then(() => {
                    Logger.info('Elemento com Id [ #divQuadroHorario ] encontrado.');
                    Logger.info('Extraindo dados...');
                })
                .evaluate(function() {

                    var DadosAula = {};
                    var horarios = [];
                    var professores = [];
                    
                    // @VARIAVEL    - trsTableQuadroHorarios;
                    //
                    // @TIPO        - Array[<tr>];
                    //
                    // @DESCRICAO   - trs com os dados dos horarios;
                    var trsTableQuadroHorarios = $('#divQuadroHorario > span > table tr');
                    
                    // @VARIAVEL    - trsTableProfessores;
                    //
                    // @TIPO        - Array[<tr>];
                    //
                    // @DESCRICAO   - trs com os dados de professor por disciplina;
                    var trsTableProfessores = $('#ctl27_gvDisciplinas tr');
                    
                    trsTableQuadroHorarios.each(function() {
                        
                        var dadosTrs = [];
                        var tr = $(this);
                        
                        // @VARIAVEL    - tds;
                        //
                        // @TIPO        - Array[<td>];
                        //
                        // @DESCRICAO   - tds da tr alvo no loop da Array [trsTableQuadroHorarios];
                        var tds = tr.find('td');
                        var horario = tds.eq(0).text();

                        tds.each(function() {

                            var td = $(this);
                            var disciplina = td.text();
                            var local = td.find('span').attr('onclick');
                            
                            dadosTrs.push({
                                disciplina: disciplina,
                                horario: horario,
                                local: local
                            })

                        });
                        
                        horarios.push(dadosTrs);
                    });
                    DadosAula['horarios'] = horarios;


                    trsTableProfessores.each(function() {

                        var tr = $(this);
                        var professor = tr.find('td:not(:hidden) > a').attr('onclick');
                        var disciplina = tr.find('td:not(:hidden)').eq(1).text();

                        professores.push({
                            professor: professor,
                            disciplina: disciplina
                        });
                    });
                    DadosAula['professores'] = professores;

                    return DadosAula;
                })
                .then((dadosAula) => {
                    
                    let quadroHorarios = dadosAula.horarios;
                    let professoresDisciplina = dadosAula.professores;
                    let semana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
                    let Professores = []
                    let Horarios = [];
            
                    quadroHorarios.forEach((elementHorarios, indexElementHorarios) => {

                        // serve para eliminar o primeiro elemento da Array; 
                        if(indexElementHorarios > 0) {

                            elementHorarios.forEach(function(element, indexElement) {

                                if(indexElement > 0) {

                                    // @VARIAVEL    - disciplina;
                                    //
                                    // @TIPO        - String;
                                    //
                                    // @DESCRICAO   - contem a disciplina e remove a String [[+]]
                                    //              - e os espaços em branco das pontas;
                                    let disciplina = element.disciplina
                                                        .replace(/(\[\+\])+/g, '')
                                                        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                                    let horario = element.horario;

                                    // @VARIAVEL    - isDisciplina;
                                    //
                                    // @TIPO        - Boolean;
                                    //
                                    // @DESCRICAO   - Verifica se a variavel [disciplina] está vazia, 
                                    //              - se estiver, significa que não é uma disciplina;
                                    let isDisciplina = disciplina.replace(/\s/g, '');
                                    let dia = semana[indexElement - 1];
                                    
                                    // @VARIAVEL    - indexDisciplinaHorario;
                                    //
                                    // @TIPO        - Integer;
                                    //
                                    // @DESCRICAO   - Variavel de controle de sobrescrita da disciplina.
                                    let indexDisciplinaHorario = -1;  
                                    let local = '';
                                    let bloco = '';                          
                                    let sala = ''; 
                            
                                    if(isDisciplina){

                                        // @LOGICA - Se a propriedade local do elemento alvo for diferente
                                        //         - de vazia;
                                        if(element.local){

                                            // remove os caracteres especiais deixando apenas os caracteres descritos
                                            // na expressao regular, junto com letras e numeros;
                                            local = element.local.replace(/[^a-zA-Z0-9\ç\s\á\à\â\é\è\ê\í\ì\ó\ò\ô\<\>]/gi, '');
                                            
                                            // extrai da variavel local apenas a String referente ao bloco onde
                                            // a disciplina é lecionada;
                                            bloco = /Bloco\s<b>(\s*\w*\s*)*(?=<br>)/gi.exec(local)[0];
                                            
                                            // extrai da variavel local apenas a String referente a sala onde
                                            // a disciplina é lecionada;
                                            sala = /(Sala\s<b>\w*)/gi.exec(local)[0];

                                            // remove as Stringsa [<b></b>] e [Bloco];
                                            bloco = bloco.replace(/<\/*b\w*>/, '').replace(/Bloco\s/, '');
                                            // remove as Stringsa [<b></b>] e [Sala];
                                            sala = sala.replace(/<\/*b\w*>/, '').replace(/Sala\s/, '');
                                        }
                                    
                                        Horarios.forEach(function (item, index){

                                            // @LOGICA - Se a disciplina já estiver adicionada
                                            //         - no objeto [Horarios], a variavel de controle
                                            //         - [indexDisciplinaHorario] recebe o indice da 
                                            //         - da propriedade onde a disciplina está inserida;
                                            if(item['disciplina'] == disciplina && item['dia'] == dia)
                                                indexDisciplinaHorario = index;
                                        });

                                        // @LOGICA - Se a variavel de controle [indexDisciplinaHorario] for
                                        //         - igual a [-1], significa que a disciplina ainda não existe
                                        //         - no objeto [Horarios], e é adicionada no objeto.
                                        //         - Senão, significa que a disciplina já existe no objeto
                                        //         - e apenas algumas propriedades para essa disciplina são 
                                        //         - incrementadas;
                                        if(indexDisciplinaHorario == -1){

                                            Horarios.push({
                                                dia: dia,
                                                disciplina: disciplina,
                                                horas: [horario],
                                                bloco: [bloco],
                                                sala: [sala]
                                            });
                                        } 
                                        else {
                                            
                                            Horarios[indexDisciplinaHorario]['bloco'].push(bloco)
                                            Horarios[indexDisciplinaHorario]['sala'].push(sala)
                                            Horarios[indexDisciplinaHorario]['horas'].push(horario);
                                        };
                                    };                                                                                 
                                };
                            });
                        };
                    });
                

                    professoresDisciplina.forEach(function(elementProfessorDisciplina, indexElementProfessorDisciplina) {

                        if(indexElementProfessorDisciplina > 0) {

                            var disciplina = elementProfessorDisciplina.disciplina.trim();

                            // @VARIAVEL  - professor;
                            //
                            // @TIPO      - Array[String];
                            //
                            // @DESCRICAO - Array com os professores da disciplina.
                            var professor = elementProfessorDisciplina.professor
                                                .match(/(?:\s*\w*\s*)*(?=<\/b>)/ig)
                                                .filter(element => element != "");

                            Professores.push({
                                nome: professor,
                                disciplina: disciplina
                            });
                        };
                    });
  
                    return resolve({Horarios, Professores});
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }
};