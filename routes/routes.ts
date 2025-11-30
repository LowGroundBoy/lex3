import { Router, NextFunction, Request, Response } from "express";
import { authenticate, restrict, create_user, teacherRestrict } from "../src/auth"
import { DisciplinasDB, UserDB, MaterialDB, Aluno } from "../database/models";
import { disciplinas_handler, find_all, editar_usuarios_disciplina } from "../database/dbfunctions";
import multer from "multer";
import { upload } from "../src/multerconfig";
import { REPLCommand } from "repl";

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
    const professoreslist = await find_all("Professores")

    res.render("cadastro_disciplina", { title: "Cadastro de disciplinas", professores: professoreslist});
});

router.post("/cadastro_disciplina", teacherRestrict, async (req: Request, res: Response) => {
    if (!req.body) return res.sendStatus(400);

    const handle = await disciplinas_handler(
        req.body.nomedisciplina,
        req.body.horario,
        req.body.professorSelecionado,
        req.body.tipo, // valor enviado deve ser "criar" ou "excluir"
    )

    if(handle){ req.session.success_msg = "disciplina criada"}
    else { req.session.error = "Erro na função handler "}

    res.redirect("/cadastro_disciplina")
})

// EDICAO DISCIPLINAS // TODO: EDITAR PROFESSOR RESPONSAVEL PELA DISCIPLINA TODO: FAZER ESSA ROTA FAZER ALGO
router.get("/editar_turma", teacherRestrict, async (req: Request, res: Response) => {
    const disciplinaSelecionada = null
    const alunosTurma = null

    const disciplinas = await find_all("Disciplinas")

    res.render("editar_turma", { title: "Editar turmas", disciplinaSelecionada, alunosTurma, disciplinas })
})

router.post("/editar_turma", teacherRestrict, async (req: Request, res: Response) => {

    editar_usuarios_disciplina(
        req.body.selecaoDisciplina,
        req.body.selecaoAluno,
        req.body.tipo
    )

    res.redirect("/editar_turma")
})

// VISUALIZACAO TODAS DISCIPLINAS
router.get("/todas_disciplinas", restrict, async (req: Request, res: Response) => {
    const todas_disciplinas = await find_all("Disciplinas") // precisa declarar como async, ja que a funcao callada é

    res.render("todas_disciplinas", { title: "Todas Disciplinas", todas_disciplinas })
})

// VISUALIZACAO MINHAS DISCIPLINAS
router.get("/minhas_disciplinas", restrict, async (req: Request, res: Response) => {
    // FIXME: SE PROFESSOR TENTAR ENTRAR DÁ PROBLEMA...
    const alunoatual = req.session.user
    const alunoDoc = await Aluno.findById(alunoatual).populate("cadeirasMatriculadas").exec();
    console.log(alunoDoc)

    if (!alunoDoc) {throw Error("Aluno não encontrado")}
   
    const minhas_disciplinas = alunoDoc.cadeirasMatriculadas
    console.log(minhas_disciplinas)

    res.render("minhas_disciplinas", { title: "Minhas Disciplinas", minhas_disciplinas })
})

// VISUALIZAR DISCIPLINA
router.get("/disciplina/:disciplina_id", restrict, async (req: Request, res: Response) => {
    if (!req.params.disciplina_id) return res.sendStatus(400);

    // TODO: LIMITAR SÓ PRA ALUNOS DA TURMA VISUALIZAREM // talvez um query no db simples pra ver se o logado bate

    const disciplina = await DisciplinasDB.findOne({_id: req.params.disciplina_id});
    const chatid = disciplina!.chatDisciplina;
    const materiais = await MaterialDB.findOne({ disciplina: req.params.disciplina_id })

    res.render("visualizar_disciplina", {title: "Visualizar Disciplina", disciplina , chatid, materiais})
})

// MATERIAIS VISUALIZAÇÃO
router.get("/materiais", restrict, async (req: Request, res: Response) => {

    const todosMateriais = await find_all("Materiais")
    console.log(todosMateriais)

    res.render("materiais", { title: "Materiais de disciplina", todosMateriais })
})

// DOWNLOAD MATERIAL
router.get("/download/:file", restrict, async (req: Request, res: Response) => {
    if (!req.params.file) return res.sendStatus(400);

    const selectedFile = req.params.file
    const filetoget = await MaterialDB.findOne({filename: selectedFile});

    if (filetoget) {
        const f_path = filetoget.path 
        return res.download(f_path)
    }
    else { 
        req.session.error = "file not found"
        res.redirect("/materiais")
     }
})

// VIDEO PLAYER
router.post("/video_player", restrict, async (req: Request, res: Response) => {

    const videoselecionado = req.body.videoselecionado
    const videodoc = await MaterialDB.findOne({ _id: videoselecionado })
    
    res.render("video_player", { title: "Video player", video: videodoc })
})

// PDF VIEWER
router.post("/pdf_viewer", restrict, async (req: Request, res: Response) => {

    const pdfselecionado = req.body.pdfselecionado
    const pdfdoc = await MaterialDB.findOne({ _id: pdfselecionado })
    
    res.render("pdf_viewer", { title: "Visualizador de pdf", pdf: pdfdoc })
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
        nomeOriginal: req.file.originalname,
        path: req.file.path,
    })

    req.session.success_msg = "Upload concluído"
    res.redirect("/upload");
})

// CHAT DISCIPLINAS
router.get("/chatroom/:chat_id", restrict, async (req: Request, res: Response) => {
    if (!req.params.chat_id) return res.sendStatus(400);

    // TODO: atualizacao constante
    const chat = req.params.chat_id

    res.render("chatroom", { title: "Chat da disciplina", })
})

export default router;