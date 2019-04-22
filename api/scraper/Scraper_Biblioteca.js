const Logger = require('../../configs/winston');

module.exports = {

    // @METODO       - run;
    //
    // @TIPO         - Promise;
    //
    // @PARAMETRO    - A Instancia do Horseman do fluxo principal;
    //
    // @FLUXO        - Fluxo Secundario Scraper - Biblioteca;
    //
    // @DESCRICAO    - Após o acesso ao portal academico feito pelo fluxo principal,
    //               - aqui é feito um redirecionamento, indo para a pagina de biblioteca
    //               - onde é iniciado a extração dos dados referente a livros reservados;
    //
    // @RETORNO      - Retorna uma Promise, resolve com os dados extraidos da biblioteca ou reject com algum erro;
    run: (horseman) => { 

        return new Promise((resolve, reject) => {

            Logger.info('Iniciando scraper de Biblioteca');

            // Inicio do fluxo secundario biblioteca a partir da instancia horseman principal
            horseman
                // Clique na opcao biblioteca na sidebar do academico
                .click('#ctl12_ctl03_accordionMenuAccordionItems3_Header_HeaderCaption')
                .then(() => {
                    Logger.info('Tentando encontrar elemento na page com Id [ #ctl12_ctl03_accordionMenuAccordionItems3_TreeView_ctl00_ctl03__CaptionCell ] ');
                })
                // Aguardando a tag [li] com a tag link [a] que redireciona para livros reservados
                .waitForSelector('#ctl12_ctl03_accordionMenuAccordionItems3_TreeView_ctl00_ctl03__CaptionCell')
                .click('#ctl12_ctl03_accordionMenuAccordionItems3_TreeView_ctl00_ctl03__CaptionCell > a')
                .then(() => {
                    Logger.info('Elemento com Id [#ctl12_ctl03_accordionMenuAccordionItems3_TreeView_ctl00_ctl03__CaptionCell] encontrado.');
                    Logger.info('Tentando encontrar elemento na page com Id [ #ViewControl_pnGrid ] ');
                })
                // Aguardando id do elemento principal que contem as informaçoes
                .waitForSelector('#ViewControl_pnGrid')
                .then(() => {
                    Logger.info('Elemento com Id [#ViewControl_pnGrid] encontrado.');
                    Logger.info('Extraindo dados...');
                })
                .evaluate(function(){
                                
                    var livros = [];
                    // @VARIAVEL  - trsTableBiblioteca;
                    //
                    // @TIPO      - Array[tr];
                    //
                    // @DESCRICAO - Tags trs da tabela de livros reservados; 
                    var trsTableBiblioteca = $('#ViewControl_pnGrid tr:not(:first)');

                    trsTableBiblioteca.each(function(){

                            var tr = $(this);
                            var codigo = tr.find('td:eq(1)').text();
                            var tipoPublicacao = tr.find('td:eq(2)').text();
                            var titulo = tr.find('td:eq(3)').text();
                            var dataEmprestimo = tr.find('td:eq(4)').text();
                            var devolucao = tr.find('td:eq(5)').text();
                            var status = tr.find('td:eq(6)').text();
        
                            livros.push({
                                codigo: codigo,
                                tipo_publicacao: tipoPublicacao,
                                titulo: titulo,
                                data_emprestimo: dataEmprestimo,
                                devolucao_prevista: devolucao,
                                status: status
                            });
                    });

                    return livros;
                })
                .then((scraperDadosBiblioteca) => {
                    return resolve(scraperDadosBiblioteca);
                })
                .catch((error) => {
                    return reject(error);
                });
        });
    }
}