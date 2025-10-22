import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import path from "path";
import { User } from "../types/user"; // retirar isso aqui depois de fazer a DB real

const app = express();
const port = 3001; // mudavel

// hash pra senhas
const createHash = require('pbkdf2-password');
const hash = createHash();

// CONFIG
app.set("view engine", "ejs"); // pra renderizar templates
app.set("views", path.join(__dirname, "../views")); // volta na pasta raiz e puxa da pasta views

// middleware tirado do exemplo no github do proprio express, temporario possivelmente, nem olhei como funciona
app.use(express.urlencoded({ extended: true }))
app.use(session({
  resave: false, // nao salva sessao se nada mudar
  saveUninitialized: false, // nao cria sessao até salvar algo
  secret: '323251531' // TEMPORARIO !!!!!!!!!!!!!!!!!!!!
}));

// mensagens de erro tiradas do exemplo tbm
app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

////////////////////////// ROTAS //////////////////////////////
// HOMEPAGE
app.get('/', (req: Request, res: Response) =>{
    res.render("home", { title: "Lex3"}); // render: html, att
});

//  TEMPORARIOS
app.get("/register", (req: Request, res: Response) =>{ // temporario
    res.render("registrar", { title: "Registrar"})
});

app.get("/restrito", restrict, (req: Request, res: Response) =>{ // teste de pagina restrita a login
    res.send("PÁGINA RESTRITA, CLIQUE PARA <a href='/logout'>SAIR</a>");
});

app.get("/logout", (req: Request, res: Response) => {
    // destroi a sessao do usuario pra deixar relogar
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/login", (req: Request, res: Response) =>{
    res.render("login", { title: "Login"})
});
// dá pra fazer coisas diferentes dependendo do tipo de request em certo endpoint ex abaixo e acima
app.post("/login", (req: Request, res: Response, next: NextFunction) => {
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


// ABRE O SERVER
app.listen(port, () => {
    console.log(`Listening na porta ${port}`)
});


////////////////////////////////////////////////////////////
// "database" de teste // TODO FAZER UMA DATABASE DE VERDADE
const users: { [key: string]: User } = {
    bruno: { name: "bruno" },
};

// criando uma senha e hash pra esse user
hash({password: "123"}, function (err: Error | null, pass: string, salt: string, hash: string) {
    if (err) throw err;

    // guarda no "banco"
    users.bruno.salt = salt;
    users.bruno.hash = hash;
});

// AUTENTICAR USER // FN recebe ERRO e USER e retorna NULL, typescript sempre precisa que o tipo das variáveis seja declarado.
function authenticate(name: string, password: string, fn: (err: Error | null, user: User | null) => void) { 
    if (!module.parent) console.log("logando usuário %s:%s", name, password);

    var user = users[name];
    // busca a db pelo user
    if (!user) return fn(null, null) // se usuario nao existe retorna null

    // aplica o hash por cima da senha de input
    console.log('comparando hash', hash, user.hash);
    hash({ password: password, salt: user.salt }, function (err: Error | null, pass: string, salt: string, hash: string) {
        if (err) return fn(err, null);

        if (hash === user.hash) return fn(null, user);

        fn(null, null);
    });
}

// RESTRINGIR PAGINAS
function restrict(req: Request, res: Response, next: NextFunction){
    if (req.session.user) { 
        next(); // se o usuário está autenticado, continua
    } 
    else {
        req.session.error = "Acesso negado.";
        res.redirect("/login");
    };
}

