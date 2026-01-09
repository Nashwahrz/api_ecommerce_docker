from pymongo import MongoClient
import os
import time

MONGO_URL = os.getenv("MONGO_URL", "mongodb://admin:admin123@mongo:27017")

def connect_with_retry():
    retries = 5
    while retries > 0:
        try:
            client = MongoClient(MONGO_URL)
            client.admin.command('ping')
            print("Connected to MongoDB")
            return client
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            retries -= 1
            time.sleep(5)
    raise Exception("Failed to connect to MongoDB after retries")

client = connect_with_retry()
db = client[os.getenv("MONGO_DB_NAME", "reviewdb")]
reviews_collection = db["reviews"]