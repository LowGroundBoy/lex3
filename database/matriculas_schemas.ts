import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

interface IMatricula extends Document {
    aluno: Types.ObjectId,
    disciplina: Types.ObjectId,
    nota: Number,
};

const matriculasInterface = new Schema<IMatricula>({
    aluno: {type: Schema.Types.ObjectId, ref: "User", required: true},
    disciplina: {type: Schema.Types.ObjectId, ref:"Disciplina", required: true},
    nota: {type: Number, default: null},
});

matriculasInterface.index({ aluno: 1, disciplina: 1 }, { unique: true });

export const MatriculasDB = mongoose.model<IMatricula>("Matricula", matriculasInterface);