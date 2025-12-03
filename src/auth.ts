import { NextFunction, Request, Response } from "express";
import { Aluno, Professor, UserDB } from "../database/user_schemas";
import { DisciplinasDB } from "../database/disciplinas_schemas";
import bcrypt from "bcrypt"

// AUTENTICAR SENHA
export async function authenticate(
    input_username: string, 
    input_password: string, 
    callback: (err: Error | null, user: string | null, acess: string | null) => void) 
    {

    const matched_user = await UserDB.findOne({username: input_username});

    if (matched_user){
        const match = await bcrypt.compare(input_password, matched_user.hash);
        if (match) { 
            return callback(null, matched_user._id!.toString(), matched_user.Tipo!); } 
        return callback(null,null,null);
    }
    else { 
        return callback(null, null, null); }
}


export function restrict(req: Request, res: Response, next: NextFunction){
    if (req.session.user) {
        next(); // se o usuário está autenticado, continua
    }
    else {
        req.session.error = "Acesso restrito a usuários logados.";
        res.redirect("/login");
    };
}

export function teacherRestrict(req: Request, res: Response, next: NextFunction){
    if (req.session.accesslvl === "Professor") { next(); }
    else { 
        req.session.error = "Acesso restrito a professores.";
        if (req.session.user) { res.redirect("/perfil"); }
        else { res.redirect("/login") };
    };
}

export async function disciplinaRestrict(req: Request, res: Response, next: NextFunction){
    const userdoc = await UserDB.findById(req.session.user);
    const disciplina = await DisciplinasDB.findOne({_id: req.params.disciplina_id});

    const checkmatricula = await DisciplinasDB.find({aluno: userdoc, disciplina: disciplina})
    if (!checkmatricula) { return req.session.error = "Você não está matriculado nessa disciplina. "}

    next();
}

// CRIAR USUÁRIO
export async function create_user(
    username: string, 
    nome: string, 
    password: string, 
    type: "Aluno" | "Professor", 
    semestre: number | null,
    callback: (code: number, msg: string | null) => void)
{
    const checkexist = await UserDB.findOne({username: username});
    if (checkexist) return callback(0, "Username em uso.")

    switch (type){
        case "Aluno": 
            await Aluno.create({
                tipo: "Aluno",
                username: username,
                nome: nome,
                hash: bcrypt.hash(password, 12),
                crDate: Date.now(),
                semestre: semestre
            })

            return callback(1, `Usuário Aluno ${username} criado com sucesso`)
        case "Professor":
            await Professor.create({
                tipo: "Professor",
                username: username,
                nome: nome,
                hash: bcrypt.hash(password, 12),
                crDate: Date.now(),
            })

            return callback(1, `Usuário Professor ${username} criado com sucesso`)
        default:
            return callback(0, "Tipo não selecionado")
    }
}