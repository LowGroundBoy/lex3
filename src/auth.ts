import session from "express-session";
import express, { NextFunction, Request, Response } from "express";
import { UserDB } from "../database/models";
import { Document } from "mongoose";
import bcrypt from "bcrypt"

export async function authenticate(input_username: string, input_password: string, callback: (err: Error | null, user: string | null) => void) {
    console.log("fazendo tentativas de login para usuario %s e com senha %s", input_username, input_password);

    const matched_user = await UserDB.findOne({username: input_username});

    if (matched_user){
        console.log("match de usuario")
        const matched_username: string = matched_user.get("username") as string;
        const match = await bcrypt.compare(input_password, matched_user.hash);
        if (match) { 
            console.log("retornando usuario: " + matched_username)
            return callback(null, matched_username); }
    }
    else { 
        console.log("senha errada")
        return callback(null, null); }
}

// RESTRINGIR PAGINAS
export function restrict(req: Request, res: Response, next: NextFunction){
    if (req.session.user) {
        next(); // se o usuário está autenticado, continua
    }
    else {
        req.session.error = "Acesso negado.";
        res.redirect("/login");
    };
}

export async function create_user(
    username: string, nome: string, 
    password: string, 
    type: "Aluno" | "Professor", 
    semestre: number | null,
    callback: (err: Error | null, msg: string | null) => void)
{
    const checkexist = await UserDB.findOne({username: username});
    if (checkexist) return callback(null, "Username em uso.") // TODO: ver como Error funciona

    switch (type){
        case "Aluno": 
            
        case "Professor":

        default:
            return callback(null, "Tipo não selecionado")
    }
}
