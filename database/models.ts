import mongoose from 'mongoose'
const { Schema } = mongoose;

const userSchema = new Schema({ // schema base, como se fosse a classe mais abstrata
    username: {type: String, unique: true}, 
    nome: {type: String, required: true},
    hash: {type: String, required: true},
    crDate: {type: Date, default: Date.now},},  
    { discriminatorKey: 'Tipo' },
);

export const UserDB = mongoose.model('User', userSchema);

export const Professor = userSchema.discriminator("Professor", new Schema({
    // material de aula, imagens? texto?
}));

export const Aluno = userSchema.discriminator("Aluno", new Schema({
    semestre: Number,
    cadeirasMatriculadas: [{nomeCadeira: String, nota: Number}],
}));