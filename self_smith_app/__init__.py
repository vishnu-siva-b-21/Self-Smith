from flask import Flask, session
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail
from flask_mongoengine import MongoEngine
from self_smith_app.config import Config

# Initialize extensions
db = MongoEngine()
bcrypt = Bcrypt()
login_manager = LoginManager()
mail = Mail()

login_manager.login_view = "main.user_login"
login_manager.login_message_category = "info"


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    mail.init_app(app)
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    @app.before_request
    def make_session_permanent():
        session.permanent = False

    # Importing all blueprints
    from self_smith_app.modules.main import main
    from self_smith_app.modules.faculty import faculty
    from self_smith_app.modules.admin import admin
    from self_smith_app.modules.errors import errors

    # Register all blueprints, setting their URL prefix
    app.register_blueprint(main, url_prefix="/")
    app.register_blueprint(faculty, url_prefix="/faculty")
    app.register_blueprint(admin, url_prefix="/admin")
    app.register_blueprint(errors)

    return app
