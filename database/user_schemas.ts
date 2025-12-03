import mongoose, { Document, SchemaTypes, Types } from 'mongoose'
const { Schema } = mongoose;

// FIXME: COLOCAR REQUIRED NOS CAMPOS DOS SCHEMAS
// typescript, precisa das checagens de tipo, então tem que extender a classe padrão "Document"
interface IUser extends Document {
    username: string;
    nome: string;
    hash: string;
    crDate: Date;
    Tipo?: string;
    semestre?: number;
    get_profile(): object;
}

// USERS
const userSchema = new Schema<IUser>({ // schema base, como se fosse a classe mais abstrata
    username: {type: String, required: true, unique: true}, 
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
        }
    }
    else {  // deve nunca acontecer, mas vai que...
        console.error("Usuário não possui discriminante"); 
        return {} 
    } 
}

export const UserDB = mongoose.model<IUser>('User', userSchema);
// PROFESSOR HERDA USERS
export const Professor = UserDB.discriminator<IUser>("Professor", new Schema({
   
}));
// ALUNO HERDA USERS
export const Aluno = UserDB.discriminator<IUser>("Aluno", new Schema({
    semestre: Number, 
}));