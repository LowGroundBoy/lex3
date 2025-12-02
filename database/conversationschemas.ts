import mongoose, { DateSchemaDefinition, Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

interface IChat extends Document {
    disciplina: Types.ObjectId | null,
    messages: Types.ObjectId[],
}

interface IMensagem extends Document {
    sender: Types.ObjectId,
    content: string,
    crDate: Date,
}

const chatSchema = new Schema<IChat>({
    disciplina: {type: Schema.Types.ObjectId},
    messages: [{type: Schema.Types.ObjectId}]
})

const messageSchema = new Schema<IMensagem>({
    sender: {type: Schema.Types.ObjectId, ref: "User"},
    content: {type: String},
    crDate: {type: Date, default: Date.now},
})

export const messageDB = mongoose.model<IMensagem>("Mensagem", messageSchema);
export const chatDB = mongoose.model<IChat>("Chat", chatSchema);