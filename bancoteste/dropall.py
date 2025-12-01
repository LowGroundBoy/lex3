# CUIDADO

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["test"]

client.drop_database(db)

print("dropada")