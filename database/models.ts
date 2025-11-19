import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

// FIXME: SEPARAR SCHEMAS EM ARQUIVOS DIFERENTES
// typescript, precisa das checagens de tipo, então tem que extender a classe padrão "Document"
interface IUser extends Document {
    username: string;
    nome: string;
    hash: string;
    crDate: Date;
    Tipo?: string;
    semestre?: number;
    cadeirasMatriculadas?: Types.ObjectId[];
    get_profile(): object;
}

interface IDisciplina extends Document {
    nomeDisciplina: string;
    horario: string;
    qtdAlunos: Number;
    alunosCadastrados: Types.ObjectId[];
    professorResponsavel: Types.ObjectId;
}

interface IMaterial extends Document{
    disciplina: Types.ObjectId,
    tipo: "pdf" | "video",
    filename: string,
    nomeOriginal: string,
    path: string,
    uploadDate: Date;
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
    alunosCadastrados: [{type: Schema.Types.ObjectId, ref: "Aluno", default: []}], // array de object IDS unicos
    professorResponsavel: {type: Schema.Types.ObjectId, unique: true, default: null},
})

// MATERIAIS
const materialSchema = new Schema<IMaterial>({
    disciplina: [{ type: Schema.Types.ObjectId, ref: "Disciplina" , default: []}],
    tipo: String,
    filename: String,
    nomeOriginal: String,
    path: String,
    uploadDate: {type: Date, default: Date.now}
})

export const MaterialDB = mongoose.model<IMaterial>("Material", materialSchema);

export const DisciplinasDB = mongoose.model<IDisciplina>('Disciplina', disciplinaSchema);

export const UserDB = mongoose.model<IUser>('User', userSchema);
// PROFESSOR HERDA USERS
export const Professor = UserDB.discriminator<IUser>("Professor", new Schema({
    // material de aula, imagens? texto?
}));
// ALUNO HERDA USERS
export const Aluno = UserDB.discriminator<IUser>("Aluno", new Schema({
    semestre: Number,
    cadeirasMatriculadas: [{ type: Schema.Types.ObjectId, ref: "Disciplina", default: [] }],
}));



