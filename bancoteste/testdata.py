from pymongo import MongoClient
from datetime import datetime
import bcrypt
from bson import ObjectId

client = MongoClient("mongodb://admin:123@localhost:27018/admin")
db = client["test"]
users = db["users"]
disciplinas = db["disciplinas"]

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

# Professores
professores = [
    {
        "_id": ObjectId(),
        "username": "prof_matematica",
        "nome": "Carlos",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Professor",
    },
    {
        "_id": ObjectId(),
        "username": "prof_fisica",
        "nome": "Ana",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Professor",
    },
    {
        "_id": ObjectId(),
        "username": "prof_historia",
        "nome": "Rafael",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Professor",
    },
]

# Alunos
alunos = [
    {
        "_id": ObjectId(),
        "username": "aluno_m1",
        "nome": "Lucas",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Aluno",
        "semestre": 2,
    },
    {
        "_id": ObjectId(),
        "username": "aluno_f1",
        "nome": "Fernanda",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Aluno",
        "semestre": 3,
    },
    {
        "_id": ObjectId(),
        "username": "aluno_h1",
        "nome": "Mateus",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Aluno",
        "semestre": 1,
    },
]

users.insert_many(professores + alunos)

disciplinas_docs = [
    {
        "nomeDisciplina": "Matemática",
        "horario": "Segunda 10:00-12:00",
        "qtdAlunos": 30,
        "alunosCadastados": [alunos[0]["_id"]],
        "professorResponsavel": professores[0]["_id"],
    },
    {
        "nomeDisciplina": "Física",
        "horario": "Terça 14:00-16:00",
        "qtdAlunos": 25,
        "alunosCadastados": [alunos[1]["_id"]],
        "professorResponsavel": professores[1]["_id"],
    },
    {
        "nomeDisciplina": "História",
        "horario": "Quinta 09:00-11:00",
        "qtdAlunos": 20,
        "alunosCadastados": [alunos[2]["_id"]],
        "professorResponsavel": professores[2]["_id"],
    },
]

disciplinas.insert_many(disciplinas_docs)
print("Professores, alunos e disciplinas inseridos com sucesso")
