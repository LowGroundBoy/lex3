import { Router, NextFunction, Request, Response } from "express";
import { authenticate, restrict, create_user, teacherRestrict } from "../src/auth"
import { DisciplinasDB, UserDB, MaterialDB } from "../database/models";
import { disciplinas_handler, find_all } from "../database/dbfunctions";
import multer from "multer";
import { upload } from "../src/multerconfig";

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

    authenticate(req.body.username, req.body.password, function(err, username, acess){
        if (err){
            console.log(err);
            return next(err);
        }
        else if (username){
            req.session.regenerate(function(){
                req.session.user = username 
                req.session.accesslvl = acess!
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
router.get("/cadastro_disciplina", teacherRestrict, async (req: Request, res: Response) => { 
const alunos = await find_all("Alunos"); // pega os alunos do banco
res.render("cadastro_disciplina", {
    title: "Cadastro de disciplinas",
    alunos // envia para o EJS
});
});

router.post("/cadastro_disciplina", teacherRestrict, (req: Request, res: Response) => {
    if (!req.body) return res.sendStatus(400);

    disciplinas_handler(
        req.body.nomedisciplina,
        req.body.horario,
        req.body.tipo, // valor retornado deve ser "criar" ou "excluir"
    )

})

// VISUALIZACAO DISCIPLINAS
router.get("/minhas_disciplinas", restrict, async (req: Request, res: Response) => {
    const todas_disciplinas = await find_all("Disciplinas") // precisa declarar como async, ja que a funcao callada é
    console.log(todas_disciplinas)

    res.render("minhas_disciplinas", {title: "Minhas Disciplinas", todas_disciplinas: todas_disciplinas})
})

// MATERIAIS VISUALIZAÇÃO
router.get("/materiais", restrict, async (req: Request, res: Response) => {

    res.render("materiais", {title: "Materiais de disciplina"}) // TODO: criar pagina de materiais
})

// UPLOAD MATERIAIS
router.get("/upload", teacherRestrict, async (req: Request, res: Response) => {
  const disciplinas = await find_all("Disciplinas")

  res.render("upload", { title: "Upload de materiais", disciplinas })
})

router.post("/upload", teacherRestrict, upload.single("file"), async (req: Request, res: Response) => { // da pra usar varias funcoes antes de rodar o endpoint EXEMPLO AQUI <
    if (!req.body) return res.sendStatus(400);
    if (!req.file) return res.sendStatus(400);

    const { disciplinaID } = req.body;
    const disciplina = await DisciplinasDB.findById(disciplinaID);
    if (!disciplina) { return res.status(404).send("Disciplina not found"); }

    const mime = req.file.mimetype;
    let tipo: "video" | "pdf";
    if (mime.startsWith("video/")) { tipo = "video"; }
    else if (mime === "application/pdf" || mime.includes("pdf")) { tipo = "pdf"; }
    else { return res.status(404).send("Tipo não suportado"); } // deve nunca acontecer, tem que falhar antes no filtro de arquivo;

    await MaterialDB.create({
        disciplina: disciplina._id,
        tipo,
        filename: req.file.filename,
        path: req.file.path,
    })

    req.session.success_msg = "Upload concluído"
    res.redirect("/upload");
})

export default router;