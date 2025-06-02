from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash,
    request,
    jsonify,
    session,
)
from self_smith_app.models import Admin, Faculty
from self_smith_app import db, bcrypt
from flask_login import current_user, login_user, login_required, logout_user
from self_smith_app.modules.main.utils import send_mail

main = Blueprint("main", __name__)


@main.route("/")
def home():
    if current_user.is_authenticated:
        flash("You are already authenticated and Logged in", category="success")
        if isinstance(current_user, Faculty):
            return redirect(url_for("faculty.faculty_dashboard"))
        elif isinstance(current_user, Admin):
            return redirect(url_for("admin.admin_dashboard"))
    user_login_email = session.pop("user_login_email", "")
    user_role = session.pop("user_role", "")
    return render_template(
        "main/home.html", user_login_email=user_login_email, user_role=user_role
    )


@main.route("/login", methods=["POST", "GET"])
def user_login():
    if request.method == "POST":
        session["user_login_email"] = request.form.get("email").strip()
        session["user_role"] = request.form.get("role")

        if session["user_role"] == "faculty":
            user = Faculty.objects(email=session["user_login_email"]).first()
        elif session["user_role"] == "admin":
            user = Admin.objects(email=session["user_login_email"]).first()
        else:
            flash("Invalid role selected!", "warning")
            return redirect(url_for("main.home"))

        remember_me = True if request.form.get("remember_me") else False

        if user:
            if bcrypt.check_password_hash(
                user.password, request.form.get("password").strip()
            ):
                login_user(user, remember=remember_me)
                next_page = request.args.get("next")
                if next_page:
                    flash(
                        "You are already authenticated and Logged in",
                        category="success",
                    )
                    return redirect(next_page)
                else:
                    flash("Login successful", category="success")
                    return redirect(
                        url_for(
                            f"{session['user_role']}.{session['user_role']}_dashboard"
                        )
                    )
            else:
                flash("Invalid password. Please try again.", category="error")
                return redirect(url_for("main.home"))
        else:
            flash("Email not found. Please try again.", category="error")
            return redirect(url_for("main.home"))
    else:
        return redirect(url_for("main.home"))


@main.route("/logout")
@login_required
def user_logout():
    session.pop("user_login_email", "")
    session.pop("user_role", "")
    logout_user()
    flash("You have been logged out", category="success")
    return redirect(url_for("main.home"))


@main.route("/db-drop-all")
def db_drop_all():
    Faculty.drop_collection()
    Admin.drop_collection()
    flash("Dropped all the database", "success")
    return redirect(url_for("main.home"))


@main.route("/user-reset-request", methods=["POST"])
def user_reset_request():
    if current_user.is_authenticated:
        return jsonify({"authorized": "You are already authenticated and Logged in"})
    if request.method == "POST":
        data = request.json
        email = data.get("email")
        user = Faculty.objects(email=email).first()
        if user:
            try:
                send_mail(user, user.get_reset_token())
            except Exception as e:
                return (
                    jsonify(
                        {"error": "Failed to send email, Need to setup Mail in config"}
                    ),
                    500,
                )
            return (
                jsonify(
                    {
                        "message": "An email has been sent with the instructions to reset your password"
                    }
                ),
                200,
            )
        else:
            return jsonify({"error": "Invalid Data or Email not registred!"}), 404


@main.route("/user-reset-password/<token>", methods=["GET", "POST"])
def user_reset_password(token):
    if current_user.is_authenticated:
        flash("You are already authenticated and Logged in", category="success")
        return redirect(url_for("main.home"))

    user = Faculty.verify_reset_token(token)

    if user is None:
        flash("That Token is Invalid or Expired!", category="warning")
        return redirect(url_for("main.home"))

    if request.method == "POST":
        hashed_password = bcrypt.generate_password_hash(
            request.form.get("password").strip()
        ).decode("utf-8")
        user.password = hashed_password
        user.reset_token_used = True
        user.save()

        flash(
            "Your Password has been updated successfully, you can now log in with your new password",
            "success",
        )
        return redirect(url_for("main.home"))

    return render_template("main/reset_password.html", token=token)
