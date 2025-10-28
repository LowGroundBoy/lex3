from pymongo import MongoClient
from datetime import datetime
import bcrypt

from pymongo import MongoClient

client = MongoClient("mongodb://admin:123@localhost:27018/admin")
db = client["test"]
users = db["users"]

# hash password
def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# example Aluno
aluno = {
    "username": "aluno1",
    "nome": "joao",
    "hash": hash_password("123"),
    "crDate": datetime.now(),
    "Tipo": "Aluno",
    "semestre": 3,
    "cadeirasMatriculadas": [
        {"nomeCadeira": "Matemática", "nota": 8},
        {"nomeCadeira": "Física", "nota": 9},
    ]
}

# example Professor
professor = {
    "username": "prof1",
    "nome": "Maria",
    "hash": hash_password("123"),
    "crDate": datetime.now(),
    "Tipo": "Professor",
}

users.insert_one(aluno)
users.insert_one(professor)

print("Aluno and Professor inserted successfully")
