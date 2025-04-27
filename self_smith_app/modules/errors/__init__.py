from flask import Blueprint, render_template, redirect, url_for

errors = Blueprint('errors', __name__)

@errors.app_errorhandler(404)
def error_404(error):
    return render_template("errors/404.html"), 404

@errors.app_errorhandler(405)
def error_405(error):
    return render_template("errors/405.html"), 405