import mongoose from 'mongoose'
const { Schema } = mongoose;

const userSchema = new Schema({ // schema base, como se fosse a classe mais abstrata
    username: {type: String, unique: true}, 
    nome: {type: String, required: true},
    hash: {type: String, required: true},
    crDate: {type: Date, default: Date.now},},  
    { discriminatorKey: 'Tipo' },
);

userSchema.methods.get_profile = function() {
    if (this.tipo === "Professor"){
        return {
            username: this.username,
            nome: this.nome,
            crDate: this.crDate,
            // algo
        }
    } else if (this.tipo === "Aluno"){
        return {
            username: this.username,
            nome: this.nome,
            crDate: this.crDate,
            semestre: this.semestre,
            cadeiras: this.cadeirasMatriculadas
        }
    }
    else { console.error("Usuário não possui discriminante"); } // deve nunca acontecer, mas vai que...
}

export const UserDB = mongoose.model('User', userSchema);

export const Professor = userSchema.discriminator("Professor", new Schema({
    // material de aula, imagens? texto?
}));

export const Aluno = userSchema.discriminator("Aluno", new Schema({
    semestre: Number,
    cadeirasMatriculadas: [{nomeCadeira: String, nota: Number}],
}));