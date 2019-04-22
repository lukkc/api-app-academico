module.exports = api => {

    let autenticacao = api.controllers.c_autenticacao;

    api.route('/login')
        .post(autenticacao.login);
}