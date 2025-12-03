import { Router, NextFunction, Request, Response } from "express";
import { authenticate, restrict, teacherRestrict, disciplinaRestrict } from "../src/auth";
import { DisciplinasDB } from "../database/disciplinas_schemas";
import { MaterialDB } from "../database/materiais_schemas";
import { UserDB, Aluno, Professor} from "../database/user_schemas";
import { MatriculasDB} from "../database/matriculas_schemas";
import { create_disciplina, find_all, editar_usuarios_disciplina } from "../database/dbfunctions";
import { upload } from "../src/multerconfig";
import { chatDB } from "../database/conversationschemas";

const router = Router()

// HOMEPAGE
router.get('/', (req: Request, res: Response) =>{
    if (req.session.user) {
        if (req.session.accesslvl === "Professor") { return res.render("home_professor", {title: "Lex3"}); }
        else { return res.render("home_aluno", {title: "Lex3"}); }
    }

    return res.render("home", { title: "Lex3"});
});

// LOGOUT
router.get("/logout", (req: Request, res: Response) => { // destroi a sessao do usuario pra deixar relogar
    
    req.session.destroy(() => {
        return res.redirect("/");
    });
});

// LOGIN
router.get("/login", (req: Request, res: Response) => {
    return res.render("login", {title: "Login"});
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
                return res.redirect("/perfil"); // volta pra pagina anterir ou /
            });
        } 
        else {
            req.session.error = "Autenticação falhou, verifique o usuário e senha"
            return res.redirect('/login')
        };
    });
});

// PERFIL
router.get("/perfil", restrict, async (req: Request, res: Response) => { 
    const userdoc = await UserDB.findById(req.session.user);
    console.log(req.session.user)
    const profiledata = userdoc?.get_profile();
    
    return res.render("meu_perfil", {title: "Perfil do usuário", profile: profiledata});
});

// CADASTRO DE DISCIPLINAS
router.get("/cadastro_disciplina", teacherRestrict, async (req: Request, res: Response) => {
    const professoreslist = await find_all("Professores")

    return res.render("cadastro_disciplina", { title: "Cadastro de disciplinas", professores: professoreslist});
});

router.post("/cadastro_disciplina", teacherRestrict, async (req, res) => {
    if (!req.body) return res.sendStatus(400);

    try {
        create_disciplina(
            req.body.nomedisciplina,
            req.body.horario,
            req.body.professorSelecionado,
            (err, success) => {
                if (err) req.session.error = String(err);
                if (success) req.session.success_msg = success;

                return res.redirect("/cadastro_disciplina");
            }
        );
    } catch (e: any) {
        req.session.error = e.message;
        return res.redirect("/cadastro_disciplina");
    }
});

// VISUALIZACAO DE TURMAS DO PROFESSOR
router.get("/minhas_turmas", teacherRestrict, async (req: Request, res: Response) => {

    const prof = await Professor.findById(req.session.user)
    if (!prof) { req.session.error = "Não foi possível encontrar o professor"; res.redirect("/perfil"); return; }

    const disciplinas = await DisciplinasDB.find({ professorResponsavel: prof._id })

    return res.render("minhas_turmas", { title: "Minhas turmas", disciplinas } )
})


router.get("/editar_turma/:disciplina", teacherRestrict, async (req: Request, res: Response) => {
    if (!req.params.disciplina) return res.sendStatus(400);

    const disciplina_selecionada = await DisciplinasDB.findById(req.params.disciplina);
    const matriculas = await MatriculasDB.find({ disciplina: disciplina_selecionada}).populate("aluno");
    console.log(matriculas)

    return res.render("editar_turma", { title: "Editar turmas", matriculas, disciplina_selecionada })
})

// ADICIONAR ALUNOS A DISCIPLINAS
router.get("/matricular_alunos", teacherRestrict, async (req: Request, res: Response) => {

    const alunos = await find_all("Alunos")
    alunos.forEach(e => {console.log(e)})
    const disciplinas = await find_all("Disciplinas")

    return res.render("matricular_alunos", { title: "Matricular alunos", alunos, disciplinas})
})
// TODO: EXCLUSAO DE ALUNOS DA DISC
router.post("/matricular_alunos", teacherRestrict, async (req: Request, res: Response) => {
    try{
        editar_usuarios_disciplina( 
        req.body.aluno_selecionado,
        req.body.disciplina_selecionada,
        "Adicionar",
        function(err, success){
            if (err) { req.session.error = String(err); }
            if (success) { req.session.success_msg = "Edição completa"; }

            return res.redirect("/matricular_alunos");
        }) 
    } catch (e: any) {
        req.session.error = e.message;
        return res.redirect("/matricular_alunos");
    }
})

// VISUALIZACAO TODAS DISCIPLINAS
router.get("/todas_disciplinas", restrict, async (req: Request, res: Response) => {
    const todas_disciplinas = await find_all("Disciplinas") // precisa declarar como async, ja que a funcao callada é

    return res.render("todas_disciplinas", { title: "Todas Disciplinas", todas_disciplinas })
})

// VISUALIZACAO MINHAS DISCIPLINAS 
router.get("/minhas_disciplinas", restrict, async (req: Request, res: Response) => {
    if (req.session.accesslvl === "Professor") { return res.redirect("/minhas_turmas") }
    const alunoatual = req.session.user
    const alunoDoc = await MatriculasDB.find({ aluno: alunoatual })
    .populate({
        path: "disciplina",
        populate: {
            path: "professorResponsavel",
            model: "User",
            select: "nome" 
        }
    });

    console.log(alunoDoc) // FIXME: REMOVER TODOS CONSOLE LOGS

    if (!alunoDoc) {throw Error("Aluno não encontrado")}

    return res.render("minhas_disciplinas", { title: "Minhas Disciplinas",  alunoDoc})
})

// VISUALIZAR DISCIPLINA // 
router.get("/disciplina/:disciplina_id", restrict, disciplinaRestrict, async (req: Request, res: Response) => {
    if (!req.params.disciplina_id) return res.sendStatus(400);

    // TODO: LIMITAR SÓ PRA ALUNOS DA TURMA VISUALIZAREM // talvez um query no db simples pra ver se o logado bate

    const disciplina = await DisciplinasDB.findOne({_id: req.params.disciplina_id});
    const chatid = disciplina!.chatDisciplina;
    const materiais = await MaterialDB.findOne({ disciplina: req.params.disciplina_id })

    return res.render("visualizar_disciplina", {title: "Visualizar Disciplina", disciplina , chatid, materiais})
})

// MATERIAIS VISUALIZAÇÃO
router.get("/materiais", restrict, async (req: Request, res: Response) => {

    const todosMateriais = await find_all("Materiais")
    console.log(todosMateriais)

    return res.render("materiais", { title: "Materiais de disciplina", todosMateriais })
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
        return res.redirect("/materiais")
     }
})

// VIDEO PLAYER
router.post("/video_player", restrict, async (req: Request, res: Response) => {

    const videoselecionado = req.body.videoselecionado
    const videodoc = await MaterialDB.findOne({ _id: videoselecionado })
    
    return res.render("video_player", { title: "Video player", video: videodoc })
})

// PDF VIEWER
router.post("/pdf_viewer", restrict, async (req: Request, res: Response) => {

    const pdfselecionado = req.body.pdfselecionado
    const pdfdoc = await MaterialDB.findOne({ _id: pdfselecionado })
    
    return res.render("pdf_viewer", { title: "Visualizador de pdf", pdf: pdfdoc })
})

// UPLOAD MATERIAIS
router.get("/upload", teacherRestrict, async (req: Request, res: Response) => {
  const disciplinas = await find_all("Disciplinas")

  return res.render("upload", { title: "Upload de materiais", disciplinas })
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
    return res.redirect("/upload");
})

// CHAT DISCIPLINAS
router.get("/chatroom/:chat_id", restrict, async (req: Request, res: Response) => {
    if (!req.params.chat_id) return res.sendStatus(400);

    const chat_id = req.params.chat_id
    const chat = await chatDB.findById(chat_id).populate({
        path: "messages",
        model: "Mensagem",
        populate: { path: "sender", select: "nome" }
    })

    if (!chat) return res.sendStatus(404);

    // TODO: atualizacao constante
    const currentuser = await UserDB.findById(req.session.user);

    return res.render("chatroom", { title: "Chat da disciplina", chat_id, currentuser, messages: chat.messages})
})

export default router;