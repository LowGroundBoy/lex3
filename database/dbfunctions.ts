import { DisciplinasDB } from "./disciplinas_schemas"
import { MaterialDB } from "./materiais_schemas"
import { UserDB, Aluno, Professor } from "./user_schemas"
import { chatDB } from "./conversationschemas"
import { Types } from "mongoose"
import { MatriculasDB } from "./matriculas_schemas"

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
            throw new Error("Tipo não selecionado");
    }
}

export async function find_all(tipo: "Alunos" | "Professores" | "Disciplinas" | "Materiais" | "Todos" ){ 
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
        case "Materiais":
            return await MaterialDB.find()
                .populate('disciplina', 'nomeOriginal') 
                .exec()
        default:
            throw new Error("Tipo não selecionado");
    }
}

export async function create_disciplina(
    nomeDisciplina: String | undefined,
    horario: String | undefined,
    professorSelecionado: String | undefined,
    callback: (err: Error | null, success: string | null) => void) 
    {
            const novadisciplina = await DisciplinasDB.create({
                nomeDisciplina: nomeDisciplina,
                horario: horario,   
                qtdAlunos: 0,
                professorResponsavel: professorSelecionado,
                chatDisciplina: null,
            })
            
            if (!novadisciplina) return callback(Error("Erro na criação de disciplina"), null);

            const novochat = await chatDB.create({
                disciplina: novadisciplina._id
            });

            if (!novochat) return callback(Error("Erro na criação de chat"), null);

            await DisciplinasDB.updateOne(
                { _id: novadisciplina._id },
                { chatDisciplina: novochat._id }
            );

            return callback(null, "Disciplinas e chats criados com sucesso.");
    }

export async function editar_usuarios_disciplina(
    usuario: Types.ObjectId,
    disciplina: Types.ObjectId,
    tipo: "Adicionar" | "Excluir",
    callback: (err: Error | null, success: Boolean) => void
)
{
    try{
        switch (tipo){
            case "Adicionar":
                try {
                    const matricular_user = await MatriculasDB.create({
                    aluno: usuario,
                    disciplina: disciplina
                })
                if(!matricular_user){ return callback(new Error("Falha ao adicionar"), false); }

                return callback(null, true);
                } catch (e: any){
                    if (e.code === 11000) {
                    return callback(new Error("Usuário já matriculado"), false);
                    }
                    return callback(e, false);
                }
    

            case "Excluir":
                const delete_user = await MatriculasDB.findOneAndDelete({aluno: usuario})
                if (!delete_user) {return callback(new Error("Falha ao adicionar"), false); }

                return callback(null, true);
            default:
                return callback(Error("Tipo não selecionado"), false)
        }
    } catch (e: any){
        return callback(e, false);
    }
     
}