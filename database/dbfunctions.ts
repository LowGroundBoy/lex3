import { UserDB, Aluno, Professor, DisciplinasDB } from "./models"

function job_queue(){} // TODO: ver se vale a pena implementar isso

export async function find_all(tipo: "Alunos" | "Professores" | "Todos"){ // TODO: talvez fazer um callback pra trabalhar com o sistema de notifs
    switch (tipo){
        case "Alunos":
            return await Aluno.find()
        case "Professores":
            return await Professor.find()
        case "Todos":
            return await UserDB.find()
        default:
            throw new Error("Tipo não selecionado");
    }
}

export async function disciplinas_handler(
    nomeDisciplina: String,
    horario: String,
    id: string | null | undefined,
    tipo: "criar" | "excluir") 
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
            await DisciplinasDB.findByIdAndDelete(id);
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