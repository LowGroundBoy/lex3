import mongoose from 'mongoose'
const { Schema } = mongoose;

const userSchema = new Schema({ // schema base, como se fosse a classe mais abstrata
    nome: String,
    hash: String,
    salt: String,
    crDate: {type: Date, default: Date.now},},  
    { discriminatorKey: 'Tipo' },
);

const User = mongoose.model('User', userSchema);

const Professor = userSchema.discriminator("Professor", new Schema({
    // material de aula, imagens? texto?
}));

const Aluno = userSchema.discriminator("Aluno", new Schema({
    semestre: Number,
    cadeirasMatriculadas: [{nomeCadeira: String, nota: Number}],
}));



export default { User, Professor, Aluno };