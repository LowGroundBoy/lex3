import session from "express-session";
import express, { NextFunction, Request, Response } from "express";
import { User } from "../types/user";

const createHash = require('pbkdf2-password');
export const hasher = createHash();

////////////////////////////////////////////////////////////
// "database" de teste // TODO FAZER UMA DATABASE DE VERDADE
const users: { [key: string]: User } = {
    bruno: { name: "bruno" },
};

// criando uma senha e hash pra esse user
hasher({password: "123"}, function (err: Error | null, pass: string, salt: string, hash: string) {
    if (err) throw err;

    // guarda no "banco"
    users.bruno.salt = salt;
    users.bruno.hash = hash;
});



// AUTENTICAR USER // FN recebe ERRO e USER e retorna NULL, typescript sempre precisa que o tipo das variáveis seja declarado.
export function authenticate(name: string, password: string, fn: (err: Error | null, user: User | null) => void) { 
    if (!module.parent) console.log("logando usuário %s:%s", name, password);

    var user = users[name];
    // busca a db pelo user
    if (!user) return fn(null, null) // se usuario nao existe retorna null

    // aplica o hash por cima da senha de input
    console.log('comparando hash', hasher, user.hash);
    hasher({ password: password, salt: user.salt }, function (err: Error | null, pass: string, salt: string, hash: string) {
        if (err) return fn(err, null);

        if (hash === user.hash) return fn(null, user);

        fn(null, null);
    });
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
