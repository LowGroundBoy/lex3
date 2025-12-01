import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

interface IMatricula extends Document {
    aluno: Types.ObjectId,
    disciplina: Types.ObjectId,
    nota: Number,
};

const matriculasInterface = new Schema<IMatricula>({
    aluno: {type: Schema.Types.ObjectId, required: true},
    disciplina: {type: Schema.Types.ObjectId, required: true},
    nota: Number,
});

export const MatriculasDB = mongoose.model<IMatricula>("Matricula", matriculasInterface);

// maybe some methods here...

//  exemplo de uso

// // get aluno with all grades
// const result = await Matricula.find({ aluno: alunoId }).populate("disciplina");