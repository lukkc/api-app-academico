function nome(dados) {
    return dados["Dados Pessoais"]["Nome"];
};


function email(dados) {
    return [dados["Dados Pessoais"]["E-mail"]];
};


function telefone(dados) {
    return {
        "celular": [dados["Dados Pessoais"]["Telefone celular"]],
        "residencial": [dados["Dados Pessoais"]["Telefone residencial"]]
    };
};


function periodoAtual(dados) {

    let periodoAtual = {
        "nome": "",
        "disciplinas": []
    };

    let idPeriodoAtual = dados["Historico"]["info"]["periodo_letivo"];
    let contPeriodo = 0;

    dados["Historico"]["periodos"].forEach(element => {

        let cont = 0;

        element.disciplinas.forEach(item => {
           if(item.periodo_letivo == idPeriodoAtual){
               cont += 1;
           }
        });

        if(cont > contPeriodo){
            periodoAtual.nome = element.periodo;
            contPeriodo = cont;
        }

    });


    dados["Faltas"].forEach(faltaPorc => {

        
        let professores = [];
        let horarios = [];
        let notas = {};
        let faltasQuantidade = 0;


        dados["Quadro de Horarios"]["Professores"].forEach(professor => {

            if(faltaPorc.disciplina == professor.disciplina){

                professores = professor.nome;

            }
        });

        
        dados["Quadro de Horarios"]["Horarios"].forEach(horario => {

            if(faltaPorc.disciplina == horario.disciplina){

                horarios
                .push({
                    "dia": horario.dia,
                    "hora": horario.horas,
                    "bloco": horario.bloco,
                    "sala": horario.sala
                });

            };
        });


        dados['NotasAndFaltas']['Faltas'].forEach(faltaQuant => {
            if(faltaPorc.disciplina == faltaQuant.disciplina){
                faltasQuantidade = faltaQuant.faltas;
            };
        })

        
        dados['NotasAndFaltas']['Notas'].forEach(nota => {
            if(faltaPorc.disciplina == nota.disciplina){
                notas = {
                    media: nota.media_geral,
                    estagio1: nota.estagio1,
                    estagio2: nota.estagio2,
                    estagio3: nota.estagio3
                }
            };
        })


        periodoAtual["disciplinas"]
        .push({
            "nome": faltaPorc.disciplina,
            "professores": professores,
            "faltasPorcentagem": faltaPorc.valor,
            "faltasQuantidade": faltasQuantidade,
            "notas": notas,
            "horarios": horarios
        });

    });

    return periodoAtual;
};


function registroNascimento(dados) {

    let dataNascimento = dados["Dados Pessoais"]["Data de nascimento"];           

    return {
        "data_nascimento": converteData(dataNascimento),
        "estado_natal": dados["Dados Pessoais"]["Estado natal"],
        "naturalidade": dados["Dados Pessoais"]["Naturalidade"],
        "filiacao": {
            "mae": dados["Dados Pessoais"]["Mãe"],
            "pai": dados["Dados Pessoais"]["Pai"]
        }
    };

};


function endereco(dados) {

    return {
        "pais": dados["Dados Pessoais"]["País"],
        "estado": dados["Dados Pessoais"]["Estado"],
        "cidade": dados["Dados Pessoais"]["Cidade"],
        "bairro": dados["Dados Pessoais"]["Bairro"],
        "logradouro": dados["Dados Pessoais"]["Logradouro"],
        "numero": dados["Dados Pessoais"]["Número"],
        "cep": dados["Dados Pessoais"]["CEP"],
        "complemento": dados["Dados Pessoais"]["Complemento"]
    };

};


function cursos(dados) {

    let dataIngresso = dados["Historico"]["info"]["Data de ingresso"];

    return [
        {
            
            "id_curso":{
                "registro_academico": dados["Dados Pessoais"]["Registro Acadêmico"], 
                "senha": dados["Dados Pessoais"]["senha"]
            },

            "nome": dados["Historico"]["info"]["Curso"],
            "coeficiente_rendimento": dados["Historico"]["info"]["Coeficiente de rendimento"],
            "data_ingresso": converteData(dataIngresso),
            "habilitacao": dados["Historico"]["info"]["Habilitação"],
            "matriz_curricular": dados["Historico"]["info"]["Matriz curricular"],
            "media_global": dados["Historico"]["info"]["Média global"],
            "situacao": dados["Historico"]["info"]["Situação"],
            "tipo_ingresso": dados["Historico"]["info"]["Tipo de ingresso"],
            "turno": dados["Historico"]["info"]["Turno"],


            "periodo_atual": periodoAtual(dados),

            "historico": dados["Historico"]["periodos"]
        }
    ]
};


function biblioteca(dados) {
    return {
        "livros_reservados": dados["Biblioteca"]
    }
};


function converteData(data) {
    data = data.replace(/([\d]*)\/([\d]*)\/([\d]*)/g, '$3-$2-$1');
    return new Date(data);
}


module.exports = (dados) => {

    let Usuario = {  
        nome: nome(dados),
        email: email(dados),
        registro_nascimento: registroNascimento(dados),
        endereco: endereco(dados),
        telefone: telefone(dados),
        cursos: cursos(dados),
        biblioteca: biblioteca(dados)
    };

    return Usuario;
};