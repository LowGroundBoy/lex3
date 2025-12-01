import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

// MATERIAIS
interface IMaterial extends Document{
    disciplina: Types.ObjectId,
    tipo: "pdf" | "video",
    filename: string,
    nomeOriginal: string,
    path: string,
    uploadDate: Date,
}

const materialSchema = new Schema<IMaterial>({
    disciplina: { type: Schema.Types.ObjectId, ref: "Disciplina" , default: []},
    tipo: String,
    filename: String,
    nomeOriginal: String,
    path: String,
    uploadDate: {type: Date, default: Date.now}
})

export const MaterialDB = mongoose.model<IMaterial>("Material", materialSchema);
