module.exports = api => {

    const usuario = api.controllers.c_usuario;
    const { accessControl } = api.middlewares.mdw_accessControl;
    const { authenticate } = api.middlewares.mdw_passport;

    api.route('/register')
        .post(accessControl, usuario.cadastro);
    
    api.post('/sync', authenticate, usuario.obterAtualizacao);
    
    api.post('/avatar/modify/:id', authenticate, usuario.alterarAvatar);

    api.delete('/avatar/delete/:id', authenticate, usuario.removerAvatar);
};