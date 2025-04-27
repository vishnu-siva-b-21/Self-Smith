from self_smith_app import bcrypt
from flask import (
    current_app,
    Blueprint,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    session,
    jsonify,
)
from flask_login import current_user, login_required
from self_smith_app.models import Badge, Faculty, Progress, Question, Responses
from self_smith_app.modules.faculty.utils import (
    return_faculty_profile_image,
    del_save_image,
)

from pprint import pprint

faculty = Blueprint("faculty", __name__)


@faculty.route("/dashboard", methods=["POST", "GET"])
@login_required
def faculty_dashboard():
    if isinstance(current_user, Faculty):
        image = return_faculty_profile_image(current_user.faculty_profile_image)
        user = Faculty.objects(email=current_user.email).first()
        ongoing_levels = []
        for i in user.progress:
            if i.status == "ongoing":
                ongoing_levels.append(i)
        serialized_ongoing_levels = [
            {
                "level": level.level,
                "total": len(Question.objects(level=level.level)),
                "user": len(level.responses),
                "progress": round(
                    round(
                        (
                            len(level.responses)
                            / len(Question.objects(level=level.level))
                        )
                        * 100,
                        2,
                    )
                ),
            }
            for level in ongoing_levels
        ]
        started_levels = []
        for i in user.progress:
            started_levels.append(i.level)
        all_unique_levels = set()
        all_questions = Question.objects.all()
        for ques in all_questions:
            all_unique_levels.add(ques.level)
        not_started_levels_list = list(all_unique_levels - set(started_levels))
        completed_levels = []
        for i in user.progress:
            if i.status == "completed":
                completed_levels.append(i)

        serialized_completed_levels = [
            {
                "level": level.level,
            }
            for level in completed_levels
        ]

        return render_template(
            "faculty/faculty_dashboard.html",
            image=image,
            user_data=user,
            not_started_levels_list=not_started_levels_list,
            serialized_ongoing_levels=serialized_ongoing_levels,
            serialized_completed_levels=serialized_completed_levels,
        )

    return redirect(url_for("main.home"))


@faculty.route("/review-levels", methods=["POST", "GET"])
@login_required
def review_levels():
    if isinstance(current_user, Faculty):
        image = return_faculty_profile_image(current_user.faculty_profile_image)
        user = Faculty.objects(email=current_user.email).first()
        completed_levels = []
        for i in user.progress:
            if i.status == "completed":
                completed_levels.append(i)

        serialized_completed_levels = [
            {
                "level": level.level,
            }
            for level in completed_levels
        ]
        for i in user.badges:
            print(i.name)
        return render_template(
            "faculty/review_levels.html",
            image=image,
            user_data=user,
            serialized_completed_levels=serialized_completed_levels,
        )
    return redirect(url_for("main.home"))


@faculty.route("/profile")
@login_required
def faculty_profile():
    if isinstance(current_user, Faculty):
        image = return_faculty_profile_image(current_user.faculty_profile_image)
        user = Faculty.objects(email=current_user.email).first()
        return render_template(
            "faculty/faculty_profile.html", image=image, user_data=user
        )
    return redirect(url_for("main.home"))


@faculty.route("/update-profile", methods=["POST", "GET"])
@login_required
def update_profile():
    if isinstance(current_user, Faculty):
        if request.method == "POST":
            file_name = (
                del_save_image(request.files["profile_pic"], request.args.get("file"))
                if request.files["profile_pic"]
                else request.args.get("file")
            )
            Faculty.objects(email=current_user.email).first().update(
                set__faculty_username=request.form.get("username").strip().lower(),
                set__email=request.form.get("email").strip(),
                set__faculty_dept=request.form.get("dept").strip(),
                set__faculty_profile_image=file_name,
            )
            flash("Profile updated successfully", "success")
            return redirect(url_for("faculty.faculty_profile"))
        return redirect(url_for("faculty.faculty_profile"))
    return redirect(url_for("main.home"))


@faculty.route("/get-ques/<level>", methods=["POST"])
@login_required
def give_questions(level):
    if isinstance(current_user, Faculty):
        if level:
            all_questions = Question.objects.filter(level=level)
            user = Faculty.objects(email=current_user.email).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            progress_entry = next((p for p in user.progress if p.level == level), None)
            attended_question_ids = (
                [str(r.question_id) for r in progress_entry.responses]
                if progress_entry
                else []
            )
            unattended_questions = [
                question
                for question in all_questions
                if str(question.id) not in attended_question_ids
            ]
            questions_data = [
                {
                    "_id": {"$oid": str(question.id)},
                    "question": question.question,
                    "correct_option": question.correct_option,
                    "lesson": question.lesson,
                    "level": question.level,
                    "status": "not-completed",
                    "max_marks": question.max_marks,
                    "options": [
                        {"ques": option.ques, "marks": option.marks}
                        for option in question.options
                    ],
                    "badges": {
                        "name": question.badge.name if question.badge else None,
                        "badge_image": (
                            return_badge_image(question.badge.badge_image) if question.badge else None
                        ),
                    },
                }
                for question in unattended_questions
            ]

            return jsonify({"ques": questions_data}), 200
        else:
            return jsonify({"error": "Level not provided"}), 400
    else:
        return jsonify({"error": "Unauthorized user"}), 401


@faculty.route("/get-comp-ques/<level>", methods=["POST"])
@login_required
def give_completed_questions(level):
    if isinstance(current_user, Faculty):
        user = Faculty.objects(email=current_user.email).first()
        if level:
            all_levels = []
            for each_level in user.progress:
                if each_level["level"] == level:
                    all_levels.extend(each_level["responses"])
            questions_data = [
                {
                    "_id": {"$oid": str(ques.id)},
                    "question": ques.question,
                    "correct_option": ques.correct_option,
                    "lesson": ques.lesson,
                    "level": ques.level,
                    "max_marks": ques.max_marks,
                    "options": [
                        {"ques": option.ques, "marks": option.marks}
                        for option in ques.options
                    ],
                    "status": "completed",
                    "user_answer": question["user_answer"],
                    "user_question_mark": question["user_question_mark"],
                    "is_correct": (
                        question["user_answer"] == ques.correct_option),
                    "badges": {
                        "name": ques.badge.name if ques.badge else None,
                        "badge_image": (
                            return_badge_image(ques.badge.badge_image) if ques.badge else None
                        ),
                    },
                }
                for question in all_levels
                for ques in Question.objects.filter(
                    id=question["question_id"]
                )  # Corrected access to `question_id`
            ]
            return jsonify({"ques": questions_data}), 200
        else:
            return jsonify({"error": "Level not provided"}), 400
    else:
        return jsonify({"error": "Unauthorized user"}), 401
import os
def return_badge_image(image):
    image_file = f"admin/images/badges/{image}"
    image_path = os.path.join(current_app.root_path, "static", image_file)
    if not os.path.exists(image_path):
        image_file = "sponsor/images/profile_pics/sponsor.png"
    return url_for("static", filename=image_file)


@faculty.route("/faculty-instruction", methods=["POST", "GET"])
@login_required
def faculty_instruction():
    if isinstance(current_user, Faculty):
        level = request.args.get("level")
        if not level:
            flash("Invaid level", "error")
            return redirect(url_for("faculty.ongoing_levels"))

        image = return_faculty_profile_image(current_user.faculty_profile_image)
        user = Faculty.objects(email=current_user.email).first()
        ques = Question.objects.filter(level=level)
        nos_ques = ques.count()
        tot_marks = sum(question.max_marks for question in ques)

        return render_template(
            "faculty/faculty_instruction.html",
            image=image,
            user_data=user,
            level=level,
            nos_ques=nos_ques,
            tot_marks=tot_marks,
        )
    return redirect(url_for("main.home"))


@faculty.route("/game", methods=["POST", "GET"])
@login_required
def faculty_game():
    if isinstance(current_user, Faculty):
        status = request.args.get("status", "ongoing")
        level = request.args.get("level")
        if not level:
            flash("Invalid level", "error")
            return redirect(url_for("faculty.ongoing_levels"))
        user = Faculty.objects(email=current_user.email).first()
        if status != "ongoing" and status != "not-started":
            referrer = request.referrer
            if not referrer or not referrer.endswith("/faculty-instruction"):
                return redirect(url_for("faculty.faculty_instruction", level=level))
        return render_template("faculty/game.html", user=user, level=level)

    return redirect(url_for("main.home"))


@faculty.route("/save-ques", methods=["POST"])
@login_required
def save_ques():
    if isinstance(current_user, Faculty):
        if request.method == "POST":
            data = request.json
            print(data)
            if data:
                question = Question.objects(id=data["ques_id"]).first()
                if not question:
                    return jsonify({"error": "Invalid question ID"}), 400
                user = Faculty.objects(email=current_user.email).first()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                ques_id = data["ques_id"]
                ques_max_marks = data["ques_max_marks"]
                user_answer = data["user_answer"]
                ques_user_mark = data["ques_user_mark"]
                level = question.level
                progress_entry = next(
                    (p for p in user.progress if p.level == level), None
                )
                if not progress_entry:
                    progress_entry = Progress(
                        level=level,
                        status="ongoing",
                        responses=[],
                    )
                    user.progress.append(progress_entry)
                response = next(
                    (
                        r
                        for r in progress_entry.responses
                        if str(r.question_id) == ques_id
                    ),
                    None,
                )

                if response:
                    response.question_max_mark = ques_max_marks
                    response.user_answer = user_answer
                    response.user_question_mark = ques_user_mark
                else:
                    new_response = Responses(
                        question_id=ques_id,
                        question_max_mark=ques_max_marks,
                        user_answer=user_answer,
                        correct_answer=question.correct_option,
                        user_question_mark=ques_user_mark,
                    )
                    progress_entry.responses.append(new_response)
                all_questions = Question.objects.filter(level=level)
                all_question_ids = {str(q.id) for q in all_questions}
                attended_question_ids = {
                    str(r.question_id) for r in progress_entry.responses
                }
                if all_question_ids == attended_question_ids:
                    progress_entry.status = "completed"

                if "badge" in data:
                    badge_data = data["badge"]
                    badge_name = badge_data.get("name")
                    badge_image = badge_data.get("badge_image")
                    if badge_name and badge_image:
                            new_badge = Badge(name=badge_name, badge_image=badge_image)
                            user.badges.append(new_badge)

                user.save()
                return jsonify({"message": "Progress saved successfully"}), 200
            else:
                return jsonify({"error": "No data received"}), 400
        else:
            return jsonify({"error": "Invalid request method"}), 405
    else:
        return jsonify({"error": "Unauthorized user"}), 401


@faculty.route("/user-review/<level>", methods=["POST", "GET"])
@login_required
def user_review(level):
    if isinstance(current_user, Faculty):
        image = return_faculty_profile_image(current_user.faculty_profile_image)
        user = Faculty.objects(email=current_user.email).first()
        all_level_ques = Question.objects.filter(level=level) if level else []
        total_level_mark = sum(ques.max_marks for ques in all_level_ques)
        user_level_response = next((p for p in user.progress if p.level == level), None)
        if user_level_response:
            serialized_user_level_response = {
                "level": user_level_response.level,
                "status": user_level_response.status,
                "total_user_level_mark": sum(
                    response.user_question_mark
                    for response in user_level_response.responses
                ),
                "responses": [
                    {
                        "question_id": str(response.question_id),
                        "question_max_mark": response.question_max_mark,
                        "user_answer": response.user_answer,
                        "correct_answer": response.correct_answer,
                        "user_question_mark": response.user_question_mark,
                    }
                    for response in user_level_response.responses
                ],
            }
        else:
            serialized_user_level_response = {
                "level": level,
                "status": "non-started",
                "total_user_level_mark": 0,
                "responses": [],
            }
        progress = round(
            (
                int(serialized_user_level_response["total_user_level_mark"])
                / int(total_level_mark)
            )
            * 100,
            2,
        )
        progress = round(progress)
        return render_template(
            "faculty/user_review.html",
            user_data=user,
            image=image,
            all_level_ques=all_level_ques,
            total_level_mark=total_level_mark,
            progress=progress,
            serialized_user_level_response=serialized_user_level_response,
            level=level,
        )
    return redirect(url_for("main.home"))


@faculty.route("/change-password", methods=["POST"])
def change_password():
    if isinstance(current_user, Faculty):
        current_password = request.json.get("currentPassword")
        new_password = request.json.get("newPassword")
        email = request.json.get("faculty_email")
        faculty_login_data = Faculty.objects(email=email).first()

        # Check if faculty exists
        if not faculty_login_data:
            return jsonify({"error": "Faculty not found"}), 404

        # Verify current password using bcrypt
        if not bcrypt.check_password_hash(
            faculty_login_data.password, current_password
        ):
            return jsonify({"error": "Incorrect current password"}), 403

        # Hash the new password before updating
        hashed_new_password = bcrypt.generate_password_hash(new_password).decode(
            "utf-8"
        )

        # Update the password in the database
        faculty_login_data.update(set__password=hashed_new_password)

        return jsonify({"message": "Password changed successfully"}), 200

    return jsonify({"error": "Unauthorized - Invalid user type"}), 401
