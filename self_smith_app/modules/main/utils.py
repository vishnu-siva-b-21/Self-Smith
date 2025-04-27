from flask import url_for
from self_smith_app import mail
from flask_mail import Message


def send_mail(user, token):
    msg = Message(
        "Password Reset Request",
        sender="donotreply@gmail.com",
        recipients=[user.email],
    )
    msg.body = f"""To reset your password visit the following link:
{url_for('main.user_reset_password', token=token, _external=True)}

Note: This Link will expire in 10 mins
If you did not make any changes simply ignore this emailand no chnages will be made"""
    mail.send(msg)
