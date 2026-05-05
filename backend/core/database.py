from mongomock_motor import AsyncMongoMockClient
from core.config import settings

class Database:
    client = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncMongoMockClient()
    print("Connected to MongoMock")

async def close_mongo_connection():
    # MongoMock doesn't need explicit close
    print("Closed MongoMock connection")

def get_database():
    return db.client[settings.DATABASE_NAME]

