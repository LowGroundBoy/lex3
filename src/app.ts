import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import path from "path";
import routes from "../routes/routes"
import mongoose from "mongoose";

export const app = express();
const port = 3001; // mudavel

// CONFIG
app.set("view engine", "ejs"); // pra renderizar templates
app.set("views", path.join(__dirname, "../views")); // volta na pasta raiz e puxa da pasta views

// TODO: middleware tirado do exemplo no github do proprio express, temporario possivelmente, nem olhei como funciona
app.use(express.urlencoded({ extended: true }))
app.use(session({
  resave: false, // nao salva sessao se nada mudar
  saveUninitialized: false, // nao cria sessao até salvar algo
  secret: '323251531' // TEMPORARIO !!!!!!!!!!!!!!!!!!!!
}));

// TODO: mensagens de erro tiradas do exemplo tbm
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

// ABRE O SERVER
async function startServer(){
  try{ 
    await mongoose.connect('mongodb://127.0.0.1:27017/'); 

    app.listen(port, () => {
    console.log(`Listening na porta ${port}`)
  });

  } catch (error) { console.error(error) }
}

startServer()




