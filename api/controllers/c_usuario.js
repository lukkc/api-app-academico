const mongoose = require('mongoose');
const scraper = require('../scraper/Scraper');
const cloudinary = require('../../configs/cloudinary')();
const bcrypt = require('bcryptjs');
const fs = require('fs');

module.exports = api => {

    let Usuario = mongoose.model('Usuario');
    let accessControl = api.middlewares.mdw_accessControl;
    let jwt = api.middlewares.mdw_passport;
    let ControllerUsuario = {

        cadastro: (req, res) => {

            let matricula = req.body.matricula;
            let senha = req.body.senha;

            // @LOGICA - Procura um usuario por sua matricula.
            //         - Se encontrar algum usuario, retorna com mensagem
            //         - informando que usuario ja existe.
            //         - Se não encontrar, tentamos extrair os dados com o scraper.
            //         - Se os dados forem extraidos, salvamos no banco, se não forem
            //         - retornamos,e retornado uma mensagem informando que não foi possivel extrair os dados.
            //         - Se ocorrer algum error ao procurar ou salvar no banco, retornamos que não foi possivel
            //         - realizar o cadastro;
            Usuario
                .findOne({
                    "cursos": {
                        $elemMatch: { "id_curso.registro_academico": matricula }
                    }
                })
                .then((usuario) => {

                    if (usuario) {
                        accessControl.remover(matricula);
                        return res.send('Essa é mesmo sua matricula? ela já está registrada.');
                    }

                    scraper(matricula, senha)
                        .then(usuario => {

                            if (!usuario)
                                throw new Error('Não foi possivel extrair os dados');

                            usuario.cursos[0].id_curso.senha = bcrypt.hashSync(senha, 10);

                            Usuario
                                .create(usuario)
                                .then((usuario) => {
                                    let token = jwt.generateToken({ _id: usuario._id });
                                    accessControl.remover(matricula);
                                    return res.send({ usuario: usuario, token: token });
                                },
                                (error) => {
                                    accessControl.remover(matricula);
                                    return res.send(error);
                                });

                        }).catch(error => {
                            accessControl.remover(matricula);
                            return res.send('Não foi possivel realizar o cadastro ' + error);

                        })

                },
                    (error) => {
                        accessControl.remover(matricula);
                        return res.send(error);

                    });

        },


        obterAtualizacao: (req, res) => {

            let matricula = req.body.matricula;
            let senha = req.body.senha;

            // @LOGICA - Procura um usuario por sua matricula.
            //         - Se encontrar algum usuario, retorna com mensagem
            //         - informando que usuario ja existe.
            //         - Se não encontrar, tentamos extrair os dados com o scraper.
            //         - Se os dados forem extraidos, salvamos no banco, se não forem
            //         - retornamos,e retornado uma mensagem informando que não foi possivel extrair os dados.
            //         - Se ocorrer algum error ao procurar ou salvar no banco, retornamos que não foi possivel
            //         - realizar o cadastro;

            scraper(matricula, senha)
                .then(usuario => {

                    if (!usuario)
                        throw new Error('Não foi possivel extrair os dados');

                    usuario.cursos[0].id_curso.senha = bcrypt.hashSync(senha, 10);

                    Usuario
                        .findOneAndUpdate({
                            "cursos": {
                                $elemMatch: { "id_curso.registro_academico": matricula }
                            }
                        }, usuario)
                        .then(() => {
                          
                            accessControl.remover(matricula);
                            return res.send({usuario: usuario});
                        },
                            (error) => {
                                accessControl.remover(matricula);
                                return res.send(error);
                            });

                }).catch(error => {
                    accessControl.remover(matricula);
                    return res.send('Não foi possivel obter atualizações ' + error);

                });

        },

        alterarAvatar: (req, res) => {

            let params = req.params;
            let file = req.file;

            if (!file || !params)
                return res.send('não foi possivel atualizar o avatar');

            let idUsuario = req.params.id;
            let pathAvatar = file.path;

            if (!idUsuario || !pathAvatar)
                return res.send('não foi possivel atualizar o avatar');



            Usuario.findById(idUsuario, (error, usuario) => {

                if (!usuario || error) {
                    fs.unlinkSync(pathAvatar);
                    return res.send('usuario não existe');
                }

                let public_idAvatarAntigo = usuario.avatar.public_id;

                fs.exists(pathAvatar, function (exists) {

                    if (!exists) {
                        fs.unlinkSync(pathAvatar);
                        return res.send('não foi possivel atualizar o avatar');
                    }


                    cloudinary.v2.uploader.upload(pathAvatar, { folder: 'avatar' }, function (error, updateAvatar) {

                        if (error) {
                            fs.unlinkSync(pathAvatar);
                            return res.send('não foi possivel atualizar o avatar');
                        }



                        fs.unlinkSync(pathAvatar);

                        let avatar = {
                            public_id: updateAvatar.public_id,
                            url: updateAvatar.secure_url
                        }


                        usuario.set({ avatar: avatar });

                        usuario.save(function (err, updatedUsuario) {

                            if (err) {

                                cloudinary.v2.uploader.destroy(updateAvatar.public_id, { folder: 'avatar' });
                                return res.send('não foi possivel atualizar o avatar');
                            }

                            cloudinary.v2.uploader.destroy(public_idAvatarAntigo);
                            return res.send(updatedUsuario);
                        });

                    });
                });

            });

        },
        removerAvatar: (req, res) => {

            let params = req.params;

            if (!params)
                return res.send('usuario não existe');

            let idUsuario = req.params.id;

            if (!idUsuario)
                return res.send('usuario não existe');

            let avatar = {
                public_id: 'avatar',
                url: 'http://res.cloudinary.com/helpi/image/upload/v1524105886/avatar/avatarDefault.svg'
            }

            Usuario.findByIdAndUpdate(idUsuario, { avatar: avatar }, (error, usuario) => {

                if (!usuario || error)
                    return res.send('usuario não existe');

                cloudinary.v2.uploader.destroy(usuario.avatar.public_id);

                return res.status(200).send('removido com sucesso ' + usuario.avatar);
            });

        }
    };

    return ControllerUsuario;
};
