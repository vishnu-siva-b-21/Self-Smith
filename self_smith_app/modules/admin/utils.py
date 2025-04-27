from flask import (
    current_app,
    url_for,
)
import os
from self_smith_app import mail
from flask_mail import Message
import secrets
from PIL import Image
import os


def return_badge_image(image):
    image_file = f"admin/images/badges/{image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    # if not os.path.exists(image_path):
    #     image_file = "faculty/images/profile_pics/faculty.png"
    return url_for("static", filename=image_file)


def save_badge_image(image, old_image):
    _, f_ext = os.path.splitext(image.filename)
    pic_filename = secrets.token_hex(8) + ".png"  # Generates a random file name
    path = os.path.join(current_app.root_path, "static/admin/images/badges")
    if not os.path.exists(path):
        os.makedirs(path)
    if old_image:
        old_image_path = os.path.join(path, old_image)
        if os.path.exists(old_image_path):
            os.remove(old_image_path)
    image = Image.open(image)
    image.thumbnail((200, 200))  # Resize image to 200x200 pixels
    image.save(os.path.join(path, pic_filename))  # Save the image
    return pic_filename  # Return the filename of the saved image


def del_faculty_image(image):
    image_file = f"faculty/images/profile_pics/{image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    if os.path.exists(image_path) and image != "faculty.png":
        os.remove(image_path)
