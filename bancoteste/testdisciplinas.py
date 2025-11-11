from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import bcrypt

client = MongoClient("mongodb://localhost:27017/")
db = client["test"]

users = db["users"]
disciplinas = db["disciplinas"]

users.delete_many({})
disciplinas.delete_many({})

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

# Create professors
professor_ids = []
for i in range(2):
    professor = {
        "username": f"professor{i+1}",
        "nome": f"Professor {i+1}",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Professor",
    }
    professor_ids.append(users.insert_one(professor).inserted_id)

# Create alunos
aluno_ids = []
for i in range(5):
    aluno = {
        "username": f"aluno{i+1}",
        "nome": f"Aluno {i+1}",
        "hash": hash_password("123"),
        "crDate": datetime.now(),
        "Tipo": "Aluno",
        "semestre": 1 + (i % 2),
        "cadeirasMatriculadas": [],
    }
    aluno_ids.append(users.insert_one(aluno).inserted_id)

# Create disciplinas
disciplina_ids = []
for i in range(3):
    alunos_disciplina = aluno_ids[i:i+2]  # assign two alunos per disciplina
    disciplina = {
        "nomeDisciplina": f"Disciplina {i+1}",
        "horario": f"{8+i}:00",
        "qtdAlunos": len(alunos_disciplina),
        "alunosCadastrados": alunos_disciplina,
        "professorResponsavel": professor_ids[i % len(professor_ids)],
    }
    disciplina_id = disciplinas.insert_one(disciplina).inserted_id
    disciplina_ids.append(disciplina_id)
    # update alunos with reference
    for aluno_id in alunos_disciplina:
        users.update_one({"_id": aluno_id}, {"$push": {"cadeirasMatriculadas": disciplina_id}})

print("Test data inserted successfully.")
print(f"{len(professor_ids)} professors, {len(aluno_ids)} alunos, {len(disciplina_ids)} disciplinas.")
