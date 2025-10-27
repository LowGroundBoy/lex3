import { Router, NextFunction, Request, Response } from "express";
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
router.get("/login", (req: Request, res: Response) => {
    res.render("login", {title: "Login"});
});
// dá pra fazer coisas diferentes dependendo do tipo de request em certo endpoint ex abaixo e acima
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) return res.sendStatus(400) // bad request

    authenticate(req.body.username, req.body.password, function(err, username){
        if (err){
            console.log(err);
            return next(err);
        }
        else if (username){
            req.session.regenerate(function(){
                req.session.user = username // TODO: checar se isso serve pra nova funcao de auth
                req.session.success_msg = "Autenticado como " + username;
                res.redirect(req.get('Referrer') || '/'); // volta pra pagina anterir ou /
            });
        } 
        else {
            req.session.error = "Autenticação falhou, verifique o usuário e senha" // TODO: talvez fazer uma função pra anunciar isso na tela (front?)
            res.redirect('/login')
        };
    });
});

export default router;