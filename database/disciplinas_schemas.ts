import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

interface IDisciplina extends Document {
    nomeDisciplina: string,
    horario: string,
    professorResponsavel: Types.ObjectId,
    chatDisciplina: Types.ObjectId | null,
}

// DISCIPLINAS
const disciplinaSchema = new Schema<IDisciplina>({
    nomeDisciplina: {type: String, unique: true, required: true},
    horario: {type: String, required: true},
    professorResponsavel: {type: Schema.Types.ObjectId, ref: "User"},
    chatDisciplina: {type: Schema.Types.ObjectId, ref: "Chat", default: null},
})


export const DisciplinasDB = mongoose.model<IDisciplina>('Disciplina', disciplinaSchema);