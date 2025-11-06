import session from "express-session";
import express, { NextFunction, Request, Response } from "express";
import { Aluno, Professor, UserDB } from "../database/models";
import { Document } from "mongoose";
import bcrypt from "bcrypt"

// AUTENTICAR SENHA
export async function authenticate(
    input_username: string, 
    input_password: string, 
    callback: (err: Error | null, user: string | null, acess: string | null) => void) 
    {
    console.log("fazendo tentativas de login para usuario %s e com senha %s", input_username, input_password);

    const matched_user = await UserDB.findOne({username: input_username});

    if (matched_user){
        console.log("match de usuario")
        const match = await bcrypt.compare(input_password, matched_user.hash);
        if (match) { 
            console.log("retornando usuario: " + matched_user.Tipo + matched_user._id!.toString())
            return callback(null, matched_user._id!.toString(), matched_user.Tipo!); } 
    }
    else { 
        console.log("senha errada")
        return callback(null, null, null); }
}

// RESTRINGIR PAGINAS TODO: EXPANDIR RESTRIÇÃO A TIPOS DE USUÁRIOS ALUNO/PROFESSOR
export function restrict(req: Request, res: Response, next: NextFunction){
    if (req.session.user) {
        next(); // se o usuário está autenticado, continua
    }
    else {
        req.session.error = "Acesso negado.";
        res.redirect("/login");
    };
}

export function teacherRestrict(req: Request, res: Response, next: NextFunction){
    if (req.session.accesslvl === "Professor") { next(); }
    else { 
        req.session.error = "Acesso negado.";
        if (req.session.user) { res.redirect("/perfil"); }
        else { res.redirect("/login") };
    };
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
    if (checkexist) return callback(0, "Username em uso.") // TODO: ver como Error funciona

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
