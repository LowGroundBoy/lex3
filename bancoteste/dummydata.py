from pymongo import MongoClient
from datetime import datetime
import bcrypt
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017")
db = client["test"]

users = db["users"]
disciplinas = db["disciplinas"]
matriculas = db["matriculas"]
chats = db["chats"]              # NEW
mensagens = db["mensagems"]      # will stay empty initially

# --------------------------
# helpers
# --------------------------

def hash_password(pwd: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd.encode("utf-8"), salt)
    return hashed.decode("utf-8")


# --------------------------
# Insert Professor
# --------------------------

prof_id = ObjectId()

professor = {
    "_id": prof_id,
    "username": "prof1",
    "nome": "Maria",
    "hash": hash_password("123"),
    "crDate": datetime.now(),
    "Tipo": "Professor",
}

users.insert_one(professor)


# --------------------------
# Insert Alunos
# --------------------------

aluno1_id = ObjectId()
aluno2_id = ObjectId()

aluno1 = {
    "_id": aluno1_id,
    "username": "aluno1",
    "nome": "Joao",
    "hash": hash_password("123"),
    "crDate": datetime.now(),
    "Tipo": "Aluno",
    "semestre": 3
}

aluno2 = {
    "_id": aluno2_id,
    "username": "aluno2",
    "nome": "Ana",
    "hash": hash_password("123"),
    "crDate": datetime.now(),
    "Tipo": "Aluno",
    "semestre": 1
}

users.insert_many([aluno1, aluno2])


# --------------------------
# Create Chatroom for the Disciplina
# --------------------------

chat_id = ObjectId()

chatroom = {
    "_id": chat_id,
    "disciplina": None,     # will fill after disciplina is created
    "messages": []
}

chats.insert_one(chatroom)


# --------------------------
# Insert Disciplina WITH chatroom
# --------------------------

disciplina_id = ObjectId()

disciplina = {
    "_id": disciplina_id,
    "nomeDisciplina": "Matemática I",
    "horario": "Terças 10:00",
    "professorResponsavel": prof_id,
    "chatDisciplina": chat_id   # ← CONNECT CHAT HERE
}

disciplinas.insert_one(disciplina)

# Now update chat so disciplina links back
chats.update_one(
    {"_id": chat_id},
    {"$set": {"disciplina": disciplina_id}}
)


# --------------------------
# Insert Matrículas
# --------------------------

mat1 = {
    "aluno": aluno1_id,
    "disciplina": disciplina_id,
    "nota": None
}

mat2 = {
    "aluno": aluno2_id,
    "disciplina": disciplina_id,
    "nota": None
}

matriculas.insert_many([mat1, mat2])

print("Finished.")
