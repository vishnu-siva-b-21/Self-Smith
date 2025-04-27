import os
from dotenv import load_dotenv

load_dotenv()


class Config(object):
    SECRET_KEY = os.getenv("SECRET_KEY")
    MONGODB_SETTINGS = {
        "db": os.getenv("MONGO_DB_NAME"),
        "host": os.getenv("MONGO_DB_HOST"),
        "username": os.getenv("MONGO_USERNAME"),
        "password": os.getenv("MONGO_PASSWORD"),
    }
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_PORT = eval(os.getenv("MAIL_PORT"))
    MAIL_USE_TLS = eval(os.getenv("MAIL_USE_TLS"))
    MAIL_USE_SSL = eval(os.getenv("MAIL_USE_SSL"))
