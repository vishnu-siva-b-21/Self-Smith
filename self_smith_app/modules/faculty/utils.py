from flask import (
    current_app,
    url_for,
)
import secrets
from PIL import Image
import os


def del_save_image(profile_pic, file):
    pic_filename = secrets.token_hex(8) + ".png"
    path = os.path.join(current_app.root_path, f"static/faculty/images/profile_pics")
    if os.path.exists(os.path.join(path, file)) and file != "faculty.png":
        os.remove(os.path.join(path, file))
    image = Image.open(profile_pic)
    image.thumbnail((200, 200))
    image.save(os.path.join(path, pic_filename))
    return pic_filename


def return_faculty_profile_image(profile_image):
    image_file = f"faculty/images/profile_pics/{profile_image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    if not os.path.exists(image_path):
        image_file = "faculty/images/profile_pics/faculty.png"
    return url_for("static", filename=image_file)
