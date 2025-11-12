# CUIDADO

from pymongo import MongoClient

client = MongoClient("mongodb://admin:123@localhost:27018/admin")

db = client["test"]

client.drop_database(db)

print("dropada")