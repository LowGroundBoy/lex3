import { Router, NextFunction, Request, Response } from "express";
import { User } from "../types/user"; // retirar isso aqui depois de fazer a DB real
import { authenticate, restrict } from "../src/auth"

const router = Router()

// HOMEPAGE
router.get('/', (req: Request, res: Response) =>{
    res.render("home", { title: "Lex3"}); // render: html, att
});

//  REGISTER
router.get("/register", (req: Request, res: Response) =>{ // NAO FAZ NADA AINDA
    res.render("registrar", { title: "Registrar"})
});

// RESTRITO (TESTE)
router.get("/restrito", restrict, (req: Request, res: Response) =>{     // teste de pagina restrita a login
    res.send("PÁGINA RESTRITA, CLIQUE PARA <a href='/logout'>SAIR</a>");
});

// LOGOUT
router.get("/logout", (req: Request, res: Response) => { // destroi a sessao do usuario pra deixar relogar
    
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// LOGIN
router.get("/login", (req: Request, res: Response) =>{
    res.render("login", { title: "Login"})
});
// dá pra fazer coisas diferentes dependendo do tipo de request em certo endpoint ex abaixo e acima
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) return res.sendStatus(400) // bad request // essencialmente checa se o body da pgina foi carregado
    authenticate(req.body.username, req.body.password, function(err: Error | null, user: User | null){
        if (err) return next(err)
        if (user){
            // prevenir fixação de sessão (tá no exemplo dos caras, basicamente tu roubar a sessão de alguém logado)
            req.session.regenerate(function(){
                // guarda a session key do user // nesse exemplo guarda o objeto user todo
                req.session.user = user;
                req.session.success = "Autenticado como " +user.name + "agora voce pode acessar <a href='/restrito'>/restrito</a>." +
                "clique aqui para <a href='/logout'>sair</a>";
                res.redirect(req.get('Referrer') || '/');
            });
        } 
        else {
            req.session.error = "Autenticação falhou, cheque seu usuário e senha";
            res.redirect("/login");
        }
    });
});

export default router;