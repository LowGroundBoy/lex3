import mongoose from 'mongoose'
const { Schema } = mongoose;

// typescript, precisa das checagens de tipo, então tem que extender a classe padrão "Document"
interface IUser extends Document {
    username: string;
    nome: string;
    hash: string;
    crDate: Date;
    Tipo?: string;
    semestre?: number;
    cadeirasMatriculadas?: { nomeCadeira: string; nota: number }[];
    get_profile(): object;
}

const userSchema = new Schema<IUser>({ // schema base, como se fosse a classe mais abstrata
    username: {type: String, unique: true}, 
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

export const UserDB = mongoose.model('User', userSchema);

export const Professor = UserDB.discriminator("Professor", new Schema({
    // material de aula, imagens? texto?
}));

export const Aluno = UserDB.discriminator("Aluno", new Schema({
    semestre: Number,
    cadeirasMatriculadas: [{nomeCadeira: String, nota: Number}],
}));