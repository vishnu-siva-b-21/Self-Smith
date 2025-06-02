import os
from dotenv import load_dotenv

load_dotenv()


class Config(object):
    SECRET_KEY = os.getenv("SECRET_KEY") or "secret_key"

    MONGODB_SETTINGS = {
        "db": os.getenv("MONGO_DB_NAME", "self_smith_db"),
        "host": os.getenv("MONGO_DB_HOST", "localhost"),
        "username": os.getenv("MONGO_USERNAME", None),
        "password": os.getenv("MONGO_PASSWORD", None),
    }


    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your_email@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your_password_or_app_password")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False").lower() == "true"
