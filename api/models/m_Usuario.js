const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// FUNCAO PARA VALIDAR UMA PROPRIEDADE OBRIGATORIA //
const required = {

    validator: (valor) => {
        valor = valor.replace(/\s/g, '');
        return valor != '';
    },

    message: 'Error: Value is null'
}


const usuarioSchema = mongoose.Schema({


    // @FLUXO - [ USUARIO ]
    nome: { 
        type: String, 
        lowercase: true, 
        validate: required
    },


    // @FLUXO - [ USUARIO ]
    avatar: {
        public_id: {
            type: String,
            default: 'avatar'
        },
        url: {
            type: String,
            default: 'http://res.cloudinary.com/helpi/image/upload/v1524105886/avatar/avatarDefault.svg'
        }
    },


    // @FLUXO - [ USUARIO ]
    email: [{ 
        type: String, 
        unique: true 
    }],
    

    // @FLUXO - [ USUARIO ]
    registro_nascimento: {

        // @FLUXO - [ USUARIO > REGISTRO_NASCIMENTO ]
        data_nascimento: Date,

        // @FLUXO - [ USUARIO > REGISTRO_NASCIMENTO ]
        estado_natal: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > REGISTRO_NASCIMENTO ]
        naturalidade: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > REGISTRO_NASCIMENTO ]
        filiacao: {
            mae: { 
                type: String, 
                lowercase: true, 
                trim: true 
            },
            pai: { 
                type: String, 
                lowercase: true, 
                trim: true 
            }
        }
    },


    // @FLUXO - [ USUARIO ]
    endereco: {

        // @FLUXO - [ USUARIO > ENDERECO ]
        pais: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        estado: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > ENDERECO ]
        cidade: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > ENDERECO ]
        bairro: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > ENDERECO ]
        logradouro: { 
            type: String, 
            lowercase: true, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > ENDERECO ]
        numero: { 
            type: String, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > ENDERECO ]
        cep: { 
            type: String, 
            trim: true 
        },

        // @FLUXO - [ USUARIO > ENDERECO ]
        complemento: { 
            type: String, 
            lowercase: true, 
            trim: true 
        }
    },


    // @FLUXO - [ USUARIO ]
    telefone: {
        celular: [{ 
            type: String, 
            lowercase: true, 
            trim: true 
        }],
        residencial: [{ 
            type: String, 
            lowercase: true, 
            trim: true 
        }]
    },


    // @FLUXO - [ USUARIO ]
    cursos: [
        { 

            // @FLUXO - [ USUARIO > CURSOS ]
            id_curso:{
                registro_academico: { 
                    type: String, 
                    trim: true, 
                    validate: required, 
                    unique: true 
                }, 
                senha: { 
                    type: String, 
                    trim: true 
                }
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            nome: { 
                type: String, 
                lowercase: true, 
                trim: true, 
                validate: required 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            coeficiente_rendimento: { 
                type: String, 
                trim: true 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            data_ingresso: Date,
            habilitacao: { 
                type: String, 
                lowercase: true, 
                trim: true 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            matriz_curricular: { 
                type: String, 
                lowercase: true, 
                trim: true 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            media_global: { 
                type: String, 
                trim: true 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            situacao: { 
                type: String, 
                lowercase: true, 
                trim: true 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            tipo_ingresso: { 
                type: String, 
                lowercase: true, 
                trim: true 
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            turno: { 
                type: String, 
                lowercase: true, 
                trim: true 
            },



            // @FLUXO - [ USUARIO > CURSOS ]
            periodo_atual: {

                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL ]
                nome: { 
                    type: String, 
                    lowercase: true, 
                    trim: true, 
                    validate: required 
                },

                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL ]
                disciplinas: [
                    {

                        // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS ]
                        nome: { 
                            type: String, 
                            lowercase: true, 
                            trim: true, 
                            validate: required 
                        },

                        // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS ]
                        professores: [{ 
                            type: String, 
                            lowercase: true, 
                            trim: true 
                        }],

                        // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS ]
                        faltasPorcentagem: { 
                            type: String, 
                            trim: true 
                        },

                        // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS ]
                        faltasQuantidade: { 
                            type: String, 
                            trim: true 
                        },

                        // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS ]
                        notas: {

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > NOTAS ]
                                estagio1: { 
                                    estagio: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    mediaEstagio: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    presencial: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    semiPresencial: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                },

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > NOTAS ]
                                estagio2: { 
                                    estagio: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    mediaEstagio: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    presencial: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    semiPresencial: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                },

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > NOTAS ]
                                estagio3: { 
                                    estagio: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    mediaEstagio: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    presencial: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                    semiPresencial: {
                                        type: String, 
                                        lowercase: true, 
                                        trim: true 
                                    },
                                },

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > NOTAS ]
                                media: { 
                                    type: String, 
                                    lowercase: true, 
                                    trim: true 
                                }
                            },

                        // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS ]
                        horarios: [
                            {

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > HORARIOS ]
                                dia: { 
                                    type: String, 
                                    lowercase: true, 
                                    trim: true 
                                },

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > HORARIOS ]
                                hora: [{ 
                                    type: String, 
                                    trim: true 
                                }],

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > HORARIOS ]
                                bloco: [{ 
                                    type: String, 
                                    lowercase: true, 
                                    trim: true 
                                }],

                                // @FLUXO - [ USUARIO > CURSOS > PERIODO_ATUAL > DISCIPLINAS > HORARIOS ]
                                sala: [{ 
                                    type: String, 
                                    lowercase: true, 
                                    trim: true 
                                }]
                            }
                        ]
                    }
                ]
            },

            // @FLUXO - [ USUARIO > CURSOS ]
            historico: [
                {

                    // @FLUXO - [ USUARIO > CURSOS > HISTORICO ]
                    periodo: { 
                        type: String, 
                        lowercase: true, 
                        trim: true, 
                        validate: required 
                    },

                    // @FLUXO - [ USUARIO > CURSOS > HISTORICO ]
                    disciplinas: [
                        {

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            nome: { 
                                type: String, 
                                lowercase: true, 
                                trim: true, 
                                validate: required 
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            situcao: { 
                                type: String, 
                                lowercase: true, 
                                trim: true 
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            periodo_letivo: { 
                                type: String, 
                                trim: true
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            media_notas: { 
                                type: String, 
                                trim: true 
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            fatas: { 
                                type: String, 
                                trim: true 
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            credito: { 
                                type: String, 
                                trim: true 
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            ch: { 
                                type: String, 
                                trim: true 
                            },

                            // @FLUXO - [ USUARIO > CURSOS > HISTORICO > DISCIPLINAS ]
                            status: { 
                                type: String, 
                                lowercase: true, 
                                trim: true 
                            }
                        }
                    ]
                }
            ],
        }
    ],

    // @FLUXO - [ USUARIO ]
    biblioteca: {

        // @FLUXO - [ USUARIO > BIBLIOTECA ]
        livros_reservados: [
            {

                // @FLUXO - [ USUARIO > BIBLIOTECA > LIVROS_RESERVADOS]
                codigo: { 
                    type: String, 
                    trim: true 
                },

                // @FLUXO - [ USUARIO > BIBLIOTECA > LIVROS_RESERVADOS]
                titulo: { 
                    type: String, 
                    lowercase: true, 
                    trim: true 
                },

                // @FLUXO - [ USUARIO > BIBLIOTECA > LIVROS_RESERVADOS]
                data_emprestimo: { 
                    type: String, 
                    lowercase: true, 
                    trim: true 
                },

                // @FLUXO - [ USUARIO > BIBLIOTECA > LIVROS_RESERVADOS]
                devolucao_prevista: { 
                    type: String, 
                    lowercase: true, 
                    trim: true 
                },

                // @FLUXO - [ USUARIO > BIBLIOTECA > LIVROS_RESERVADOS]
                status: { 
                    type: String, 
                    lowercase: true, 
                    trim: true 
                },

                // @FLUXO - [ USUARIO > BIBLIOTECA > LIVROS_RESERVADOS]
                tipo_publicacao: { 
                    type: String, 
                    lowercase: true, 
                    trim: true 
                }
            }
        ]
    }
});

// usuarioSchema.pre('save', function(next) {
  
//     if(!this.isNew)
//         return next();

//     let senha = this.cursos[0].id_curso.senha;
    
//     this.cursos[0].id_curso.senha = bcrypt.hashSync(senha, 10);
    
//     return next();
// });

mongoose.model('Usuario', usuarioSchema);
    
