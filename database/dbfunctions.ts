import { UserDB, Aluno, Professor, DisciplinasDB } from "./models"

// funcoes internas
function job_queue(){} // TODO: ver se vale a pena implementar isso

async function count_totals(
    tipo: "Alunos" | "Professores" | "Disciplinas"
){
    switch (tipo){
        case "Alunos":
            return await Aluno.countDocuments()
        case "Professores":
            return await Professor.countDocuments()
        case "Disciplinas":
            return await DisciplinasDB.countDocuments()
        default:
            throw new Error("Tip1o não selecionado");
    }
}

export async function find_all(tipo: "Alunos" | "Professores" | "Disciplinas" | "Todos"){ // TODO: talvez fazer um callback pra trabalhar com o sistema de notifs
    switch (tipo){
        case "Alunos":
            return await Aluno.find().exec()
        case "Professores":
            return await Professor.find().exec()
        case "Todos":
            return await UserDB.find().exec()
        case "Disciplinas":
            return await DisciplinasDB.find().exec()
        default:
            throw new Error("Tipo não selecionado");
    }
}

export async function disciplinas_handler(
    nomeDisciplina: String | undefined,
    horario: String | undefined,
    tipo: "criar" | "excluir") // TODO: fazer um callback aqui
    {
    switch (tipo){
        case "criar":
            DisciplinasDB.create({
                nomeDisciplina: nomeDisciplina,
                horario: horario,   
                qtdAlunos: 0,
                // professor e matriculados é nenhum por default
            })
        case "excluir":
            await DisciplinasDB.findByIdAndDelete("nomeDisciplina");
            // return algo
        default:
            throw new Error("Tipo não selecionado");
    }
}

export function editar_usuarios_disciplina(tipo: "matricular" | "remover"){
    switch (tipo){
        case "matricular":

        case "remover":

        default:

    }
}