import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import path from "path";
import routes from "../routes/routes"
import mongoose from "mongoose";
import http from "http";
import { socketSetup } from "./socket";

const app = express();
const server = http.createServer(app);
const port = 3001; // mudavel

// CONFIG
app.set("view engine", "ejs"); // pra renderizar templates
app.set("views", path.join(__dirname, "../views")); // volta na pasta raiz e puxa da pasta views

app.use(express.urlencoded({ extended: true }))
app.use(session({
  resave: false, // nao salva sessao se nada mudar
  saveUninitialized: false, // nao cria sessao até salvar algo
  secret: '323251531' // FIXME: TEMPORARIO !!!!!!!!!!!!!!!!!!!!
}));

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success_msg;
  delete req.session.error;
  delete req.session.success_msg;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="success">' + msg + '</p>';
  next();
});

app.use(routes);
app.use(express.static("public")); // CSS e JS pra paginas
app.use("/videos", express.static("uploads/videos")); // uploads
app.use("/pdfs", express.static("uploads/pdf"));


// UPLOAD CONFIG
app.use("/files", express.static(path.join(__dirname, "../uploads")));

// ABRE O SERVER
async function startServer() {
  const localUri = "mongodb://127.0.0.1:27017/";
  const containerUri = process.env.MONGO_URI;

  try {
    // Tenta conectar localmente primeiro
    await mongoose.connect(localUri);
    console.log("Conectado ao MongoDB local");
  } catch (localError) {
    console.warn("Falha ao conectar localmente, tentando URI do container...");
    
    try {
      // Se falhar, tenta conectar via URI do container
      if (!containerUri) {
        throw new Error("MONGO_URI não está definida nas variáveis de ambiente");
      }
      await mongoose.connect(containerUri);
      console.log("Conectado ao MongoDB via container");
    } catch (containerError) {
      console.error("Falha ao conectar ao MongoDB:");
      console.error("Erro local:", localError);
      console.error("Erro container:", containerError);
      process.exit(1);
    }
  }

  // socket.io (chat realtime)
  socketSetup(server);

  server.listen(port, () => {
    console.log(`Listening na porta ${port}`);
  });
}

startServer()