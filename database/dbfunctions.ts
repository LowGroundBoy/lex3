import { UserDB, Aluno, Professor, DisciplinasDB, MaterialDB } from "./models"
import { Types } from "mongoose"

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
            return await DisciplinasDB.find()
                .populate('professorResponsavel', 'nome') // popula só o campo nome do professor
                .exec()
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
            return true
        case "excluir":
            await DisciplinasDB.findByIdAndDelete("nomeDisciplina");
            return true
        default:
            throw new Error("Tipo não selecionado");
    }
}

export async function editar_usuarios_disciplina(
    disciplinaIn: string,
    alunoIn: string,
    tipo: "matricular" | "remover")
    {
    const disciplina = await DisciplinasDB.findOne({nomeDisciplina: disciplinaIn});
    const aluno = await Aluno.findOne({nome: alunoIn});

    switch (tipo){
        case "matricular":   
            if (disciplina && aluno) { 
                disciplina.alunosCadastrados.push(aluno._id as Types.ObjectId) // FIXME: ISSO AQUI VAI DAR MERDA
                aluno.cadeirasMatriculadas!.push(disciplina._id as Types.ObjectId)
            } 
            else{ return } // TODO: escrever retorno

        case "remover":
            if (disciplina && aluno) {
                disciplina.alunosCadastrados = disciplina.alunosCadastrados.filter(
                id => !id.equals(aluno._id as Types.ObjectId));
            }
        default:
            throw new Error("Tipo não selecionado");
    }
}