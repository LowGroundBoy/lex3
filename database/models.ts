import mongoose, { Document, Types } from 'mongoose'
const { Schema } = mongoose;

// typescript, precisa das checagens de tipo, então tem que extender a classe padrão "Document"
interface IUser extends Document {
    username: string;
    nome: string;
    hash: string;
    crDate: Date;
    Tipo?: string;
    semestre?: number;
    cadeirasMatriculadas?: { nomeCadeira: string; nota: number }[];
    get_profile(): object;
}

interface IDisciplina extends Document {
    nomeDisciplina: string;
    horario: string;
    qtdAlunos: Number;
    alunosCadastados: Types.ObjectId;
    professorResponsavel: Types.ObjectId;
}
// USERS
const userSchema = new Schema<IUser>({ // schema base, como se fosse a classe mais abstrata
    username: {type: String, required: true, unique: true}, 
    nome: {type: String, required: true},
    hash: {type: String, required: true},
    crDate: {type: Date, default: Date.now},},  
    { discriminatorKey: 'Tipo' },
);

userSchema.methods.get_profile = function(this: IUser) {
    if (this.Tipo === "Professor"){
        return {
            username: this.username,
            nome: this.nome,
            crDate: this.crDate,
            // algo
        }
    } else if (this.Tipo === "Aluno"){
        return {
            username: this.username,
            nome: this.nome,
            crDate: this.crDate,
            semestre: this.semestre,
            cadeiras: this.cadeirasMatriculadas
        }
    }
    else {  // deve nunca acontecer, mas vai que...
        console.error("Usuário não possui discriminante"); 
        return {} 
    } 
}

// DISCIPLINAS
const disciplinaSchema = new Schema<IDisciplina>({
    nomeDisciplina: {type: String, unique: true},
    horario: {type: String},
    qtdAlunos: {type: Number},
    alunosCadastados: [{type: Schema.Types.ObjectId, ref: "Aluno", unique: true, default: []}], // array de object IDS unicos
    professorResponsavel: {type: Schema.Types.ObjectId, unique: true, default: null},
})

export const DisciplinasDB = mongoose.model('Disciplina', disciplinaSchema);

export const UserDB = mongoose.model('User', userSchema);
// PROFESSOR HERDA USERS
export const Professor = UserDB.discriminator("Professor", new Schema({
    // material de aula, imagens? texto?
}));
// ALUNO HERDA USERS
export const Aluno = UserDB.discriminator("Aluno", new Schema({
    semestre: Number,
    cadeirasMatriculadas: [{nomeCadeira: String, nota: Number}],
}));



