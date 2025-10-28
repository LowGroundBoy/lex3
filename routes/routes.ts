import { Router, NextFunction, Request, Response } from "express";
import { authenticate, restrict, create_user } from "../src/auth"
import { UserDB } from "../database/models";


const router = Router()

// HOMEPAGE
router.get('/', (req: Request, res: Response) =>{
    res.render("home", { title: "Lex3"}); // render: html, att
});

//  REGISTER
router.get("/register", (req: Request, res: Response) =>{ // NAO FAZ NADA AINDA
    res.render("registrar", { title: "Registrar"})
});
router.post("/register", (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) return res.sendStatus(400)

    create_user(req.body.username, req.body.nome, req.body.password, req.body.type, req.body.semestre, function(code, msg){

        if (code === 1) {
            req.session.success_msg = "Usuário criado com sucesso, faça login com a nova conta para continuar"
            res.redirect("/login")
        }
        else { 
            req.session.error = "Ocorreu um erro na criação de usuário"
            res.redirect("/register")
        }
    })
})

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
                req.session.user = username 
                req.session.success_msg = "Autenticado como " + username;
                res.redirect("/perfil"); // volta pra pagina anterir ou /
            });
        } 
        else {
            req.session.error = "Autenticação falhou, verifique o usuário e senha" // TODO: talvez fazer uma função pra anunciar isso na tela (front?)
            res.redirect('/login')
        };
    });
});

// PERFIL
router.get("/perfil", restrict, async (req: Request, res: Response) => { // TODO: FAZER O PERFIL PUXAR DOS DADOS DO USUARIO LOGADO
    const userdoc = await UserDB.findById(req.session.user);
    console.log(req.session.user)
    const profiledata = userdoc?.get_profile();
    
    res.render("meu_perfil", {title: "Perfil do usuário", profile: profiledata});
});

// CADASTRO DE DISCIPLINAS
router.get("/cadastro_disciplina", restrict, (req: Request, res: Response) => { // TODO: Permitir acesso só de professores
    res.render("cadastro_disciplina", {title: "Cadastro de disciplinas"})
});

export default router;