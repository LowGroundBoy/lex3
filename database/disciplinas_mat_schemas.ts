import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

// FIXME: SEPARAR SCHEMAS EM ARQUIVOS DIFERENTES
// FIXME: COLOCAR REQUIRED NOS CAMPOS DOS SCHEMAS

interface IDisciplina extends Document {
    nomeDisciplina: string,
    horario: string,
    qtdAlunos: Number,
    professorResponsavel: Types.ObjectId,
    chatDisciplina: Types.ObjectId | null,
}

interface IMaterial extends Document{
    disciplina: Types.ObjectId,
    tipo: "pdf" | "video",
    filename: string,
    nomeOriginal: string,
    path: string,
    uploadDate: Date,
}


// DISCIPLINAS
const disciplinaSchema = new Schema<IDisciplina>({
    nomeDisciplina: {type: String, unique: true, required: true},
    horario: {type: String, required: true},
    qtdAlunos: {type: Number},
    professorResponsavel: {type: Schema.Types.ObjectId, unique: true},
    chatDisciplina: {type: Schema.Types.ObjectId, ref: "Chat", default: null},
})

// MATERIAIS
const materialSchema = new Schema<IMaterial>({
    disciplina: { type: Schema.Types.ObjectId, ref: "Disciplina" , default: []},
    tipo: String,
    filename: String,
    nomeOriginal: String,
    path: String,
    uploadDate: {type: Date, default: Date.now}
})

export const MaterialDB = mongoose.model<IMaterial>("Material", materialSchema);

export const DisciplinasDB = mongoose.model<IDisciplina>('Disciplina', disciplinaSchema);





