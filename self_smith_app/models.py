from self_smith_app import db, login_manager
from itsdangerous.url_safe import URLSafeTimedSerializer as Serializer
from flask_login import UserMixin
from flask import current_app
from mongoengine import (
    Document,
    StringField,
    ListField,
    EmbeddedDocument,
    EmbeddedDocumentField,
    IntField,
    EmailField,
    BooleanField,
    ObjectIdField,
    ValidationError,
)


@login_manager.user_loader
def load_user(user_id):
    return Faculty.objects(id=user_id).first() or Admin.objects(id=user_id).first()


class Admin(Document, UserMixin):
    meta = {"collection": "admins"}

    email = EmailField(required=True, unique=True)
    password = StringField(required=True, min_length=4)
    default_user_password = StringField(required=True, min_length=4, default="sist2025")

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f"Admin({self.email})"


class Badge(EmbeddedDocument):
    name = StringField(required=True)
    badge_image = StringField(required=True)


class Responses(EmbeddedDocument):
    question_id = ObjectIdField(required=True)
    question_max_mark = IntField(required=True)
    user_answer = StringField(required=True)
    correct_answer = StringField(required=True)
    user_question_mark = IntField(required=True)


class Progress(EmbeddedDocument):
    level = StringField(required=True, choices=("1", "2", "3", "4"))
    status = StringField(required=True, choices=("ongoing", "completed", "non-started"))
    responses = ListField(EmbeddedDocumentField(Responses), default=list)


class Faculty(Document, UserMixin):
    meta = {"collection": "faculties"}

    email = EmailField(required=True, unique=True)
    faculty_username = StringField(required=True)
    faculty_dept = StringField(required=True)
    password = StringField(required=True, min_length=6)
    faculty_profile_image = StringField(default="faculty.png")
    reset_token_used = BooleanField(default=False)

    progress = ListField(EmbeddedDocumentField(Progress), default=list)
    badges = ListField(EmbeddedDocumentField(Badge), default=list)

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f"Faculty({self.faculty_username})"

    def get_reset_token(self):
        serializer_object = Serializer(
            current_app.config["SECRET_KEY"], salt="email-verification"
        )
        return serializer_object.dumps({"user_id": str(self.id)})

    @staticmethod
    def verify_reset_token(token, expires_sec=600):
        serializer_object = Serializer(
            current_app.config["SECRET_KEY"], salt="email-verification"
        )
        try:
            user_id = serializer_object.loads(token, max_age=expires_sec)["user_id"]
        except Exception:
            return None

        user = Faculty.objects(id=user_id).first()
        if user is None or not (user.reset_token_used):
            return None

        return user


class Option(EmbeddedDocument):
    ques = StringField(required=True)
    marks = IntField(required=True)


class Question(Document):
    meta = {"collection": "questions"}

    question = StringField(required=True)
    max_marks = IntField(required=True)
    lesson = StringField(required=True)
    level = StringField(required=True, choices=("1", "2", "3", "4"))
    options = ListField(EmbeddedDocumentField(Option), required=True)
    correct_option = StringField(required=True)
    badge = EmbeddedDocumentField(Badge, default=None)

    def clean(self):
        option_values = [opt.ques for opt in self.options]
        if self.correct_option not in option_values:
            raise ValidationError("correct_option must match one of the options.")

    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f"Question({self.id})"
