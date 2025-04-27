from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    jsonify,
)
from mongoengine import ValidationError
from self_smith_app import bcrypt
from flask_login import current_user, login_required
from self_smith_app.models import Admin, Badge, Faculty, Question, Option
from bson import ObjectId
import pandas as pd
import re
from self_smith_app.modules.admin.utils import (
    del_faculty_image,
    return_badge_image,
    save_badge_image,
)

admin = Blueprint("admin", __name__)


@admin.route("/receive-store-ques", methods=["POST"])
def receive_store_ques():
    if isinstance(current_user, Admin):
        mcq_ques = request.json
        try:
            question_text = mcq_ques.get("question")
            max_marks = mcq_ques.get("maxMarks")
            lesson = mcq_ques.get("lesson")
            level = mcq_ques.get("Level")
            correct_option = mcq_ques.get("correctOption")
            options_data = mcq_ques.get("options", [])
            options = [
                Option(ques=opt["ques"], marks=opt["marks"]) for opt in options_data
            ]
            question = Question(
                question=question_text,
                max_marks=max_marks,
                lesson=lesson,
                level=level,
                options=options,
                correct_option=correct_option,
            )
            question.save()
            return jsonify({"message": "Question added successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Unauthorized access"}), 403


@admin.route("/get-csv-store-questions", methods=["POST"])
def get_csv_store_questions():
    if isinstance(current_user, Admin):
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        try:
            # Load the file into a DataFrame
            if file.filename.endswith(".csv"):
                df = pd.read_csv(file)
            elif file.filename.endswith(".xlsx"):
                df = pd.read_excel(file)
            else:
                return jsonify({"error": "Unsupported file format"}), 400

            if df.empty:
                return jsonify({"error": "The uploaded file is empty."}), 400

            # Required columns
            required_columns = {
                "question",
                "max_mark",
                "lesson",
                "level",
                "correct_option",
            }
            missing_columns = required_columns - set(df.columns.str.lower())
            if missing_columns:
                return (
                    jsonify(
                        {"error": f"Missing columns: {', '.join(missing_columns)}"}
                    ),
                    400,
                )

            # Lesson mappings
            lesson_mappings = {
                "innovative pedagogies": "l1",
                "student psychology": "l2",
                "communication skills": "l3",
                "course and programme outcome": "l4",
                "research culture": "l5",
                "ethics & values": "l6",
            }

            added_rows = []
            error_message = None

            # Validate and process each row
            for index, row in df.iterrows():
                try:
                    # Safe extraction of values
                    question_text = str(row.get("question", "")).strip()
                    lesson = str(row.get("lesson", "")).strip().lower()
                    level = row.get("level")
                    max_mark = row.get("max_mark")
                    correct_option = str(row.get("correct_option", "")).strip()

                    # Validate question
                    if not question_text:
                        raise ValueError(
                            f"Missing or invalid question at row {index + 1}"
                        )

                    # Validate lesson
                    if lesson not in lesson_mappings:
                        raise ValueError(
                            f"Invalid lesson '{lesson}' at row {index + 1}. Allowed values: {', '.join(lesson_mappings.keys())}"
                        )
                    lesson_code = lesson_mappings[lesson]

                    # Validate level (it should be an integer between 1 and 4)
                    if not isinstance(level, (int, float)) or not (1 <= level <= 4):
                        raise ValueError(
                            f"Invalid level '{level}' at row {index + 1}. It must be an integer between 1 and 4."
                        )

                    # Validate max_mark
                    if not isinstance(max_mark, (int, float)) or max_mark <= 0:
                        raise ValueError(f"Invalid max mark at row {index + 1}")
                    max_mark = int(max_mark)

                    # Collect dynamic options
                    options = []
                    option_prefix = "op"
                    mark_prefix = "op_"
                    for i in range(1, len(df.columns)):  # Adjust range for more options
                        option_key = f"{option_prefix}{i}"
                        mark_key = f"{mark_prefix}{i} mark"

                        if option_key in df.columns and mark_key in df.columns:
                            option_text = row.get(option_key, "")
                            option_mark = row.get(mark_key, None)

                            # Safeguard for option text
                            option_text = (
                                str(option_text).strip()
                                if pd.notna(option_text)
                                else ""
                            )

                            # Skip if option text is empty
                            if not option_text:
                                continue

                            # Validate option mark
                            if not isinstance(option_mark, (int, float)):
                                raise ValueError(
                                    f"Option {i} mark is not an integer or missing at row {index + 1}"
                                )
                            option_mark = int(option_mark)

                            if option_mark > max_mark:
                                raise ValueError(
                                    f"Option {i} mark cannot be greater than max mark at row {index + 1}"
                                )

                            options.append({"ques": option_text, "marks": option_mark})

                    # Validate at least two options are provided
                    if len(options) < 2:
                        raise ValueError(
                            f"At least two valid options are required at row {index + 1}"
                        )

                    # Validate correct_option exists among the options
                    if not any(opt["ques"] == correct_option for opt in options):
                        raise ValueError(
                            f"Correct option not found in options at row {index + 1}"
                        )

                    # Validate correct_option marks
                    correct_option_marks = next(
                        (
                            opt["marks"]
                            for opt in options
                            if opt["ques"] == correct_option
                        ),
                        None,
                    )
                    if correct_option_marks != max_mark:
                        raise ValueError(
                            f"Correct option marks must equal max mark at row {index + 1}"
                        )

                    # Ensure no other options have marks equal to or greater than max_mark
                    for opt in options:
                        if opt["ques"] != correct_option and opt["marks"] >= max_mark:
                            raise ValueError(
                                f"Option '{opt['ques']}' at row {index + 1} has marks equal to or greater than the max mark, which is only allowed for the correct option."
                            )

                    # Check for existing question with the same details, including options and marks
                    existing_question = Question.objects(
                        question=question_text,
                        max_marks=max_mark,
                        lesson=lesson_code,
                        level=str(int(level)),
                        correct_option=correct_option,
                    ).first()

                    if existing_question:
                        # Verify that all options match
                        existing_options = [
                            {"ques": opt.ques, "marks": opt.marks}
                            for opt in existing_question.options
                        ]
                        new_options = [
                            {"ques": opt["ques"], "marks": opt["marks"]}
                            for opt in options
                        ]

                        # Sort options for comparison to ensure order doesn't matter
                        if sorted(
                            existing_options, key=lambda x: (x["ques"], x["marks"])
                        ) == sorted(new_options, key=lambda x: (x["ques"], x["marks"])):
                            continue  # Skip adding this question if everything matches

                    # Create Option objects
                    option_objs = [
                        Option(ques=opt["ques"], marks=opt["marks"]) for opt in options
                    ]

                    # Add question to the database
                    question = Question(
                        question=question_text,
                        max_marks=max_mark,
                        lesson=lesson_code,
                        level=str(int(level)),
                        options=option_objs,
                        correct_option=correct_option,
                    )
                    question.save()
                    added_rows.append(index + 1)

                except ValueError as e:
                    error_message = str(e)
                    break
                except ValidationError as e:
                    error_message = f"Validation error at row {index + 1}: {str(e)}"
                    break

            if error_message:
                return (
                    jsonify(
                        {
                            "error": error_message,
                            "added_rows": added_rows or [],
                        }
                    ),
                    400,
                )
            else:
                return (
                    jsonify(
                        {
                            "message": f"File {file.filename} processed successfully",
                            "added_rows": added_rows,
                        }
                    ),
                    200,
                )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Unauthorized access"}), 403


@admin.route("/add-admin", methods=["POST", "GET"])
@login_required
def add_admin():
    if isinstance(current_user, Admin):
        existing_user = Admin.objects(email=request.form.get("email").strip()).first()
        if existing_user is None:
            hashed_password = bcrypt.generate_password_hash(
                request.form.get("password").strip()
            ).decode("utf-8")
            admin = Admin(
                email=request.form.get("email").strip(),
                password=hashed_password,
            )
            admin.save()
            flash(f"Admin added successfully", "success")
        else:
            flash(
                f"Admin already exists, Please use a different email.",
                "error",
            )
        return redirect(url_for("admin.user_list"))
    return redirect(url_for("main.home"))


@admin.route("/add-admin-2", methods=["POST", "GET"])
def add_admin_2():
    hashed_password = bcrypt.generate_password_hash("admin").decode("utf-8")
    admin = Admin(
        email="admin@gmail.com",
        password=hashed_password,
    )
    admin.save()
    flash(f"Admin added successfully", "success")
    return redirect(url_for("main.home"))


@admin.route("/dashboard", methods=["POST", "GET"])
@login_required
def admin_dashboard():
    if isinstance(current_user, Admin):
        user_data = Admin.objects(email=current_user.email).first()
        return render_template("admin/admin_dashboard.html", user=user_data)
    return redirect(url_for("main.home"))


@admin.route("/user-list", methods=["POST", "GET"])
@login_required
def user_list():
    if isinstance(current_user, Admin):
        users = Faculty.objects.all()
        admins = Admin.objects.all()
        return render_template("admin/user_list.html", users=users, admins=admins)
    return redirect(url_for("main.home"))


@admin.route("/del-ques-<id>", methods=["POST"])
def delete_ques(id):
    if isinstance(current_user, Admin):
        try:
            object_id = ObjectId(id)
        except Exception as e:
            flash("Invalid question ID format.", "error")
            return redirect(url_for("admin.view_question"))
        question_to_delete = Question.objects(id=object_id).only("question").first()
        if question_to_delete:
            question_to_delete.delete()
            flash("Selected question records are deleted successfully", "success")
        else:
            flash("Question not found", "error")
        return redirect(url_for("admin.view_question"))
    return redirect(url_for("main.home"))


@admin.route("/del-faculty-<id>", methods=["POST"])
def delete_faculty(id):
    if isinstance(current_user, Admin):
        try:
            object_id = ObjectId(id)
        except Exception as e:
            flash("Invalid faculty ID format.", "error")
            return redirect(url_for("admin.user_list"))
        faculty_to_delete = Faculty.objects(id=object_id).only("email").first()
        if faculty_to_delete:
            del_faculty_image(faculty_to_delete.faculty_profile_image)
            faculty_to_delete.delete()
            flash("Selected faculty records are deleted successfully", "success")
        else:
            flash("Faculty not found", "error")
        return redirect(url_for("admin.user_list"))
    return redirect(url_for("main.home"))


import json


@admin.route("/delete-many-faculty", methods=["POST"])
def delete_many_faculty():
    if isinstance(current_user, Admin):
        user_ids = request.form.get("user_ids")
        if user_ids:
            user_ids = json.loads(user_ids)
            errors = []
            success_count = 0
            for id in user_ids:
                try:
                    object_id = ObjectId(id)
                except Exception as e:
                    errors.append(f"Invalid ID format: {id}")
                    continue
                faculty_to_delete = Faculty.objects(id=object_id).only("email").first()
                if faculty_to_delete:
                    try:
                        del_faculty_image(faculty_to_delete.faculty_profile_image)
                        faculty_to_delete.delete()
                        success_count += 1
                    except Exception as e:
                        errors.append(f"Error deleting faculty with ID {id}: {str(e)}")
                else:
                    errors.append(f"Faculty not found for ID {id}")
            if success_count > 0:
                flash(
                    f"Successfully deleted {success_count} faculty record(s).",
                    "success",
                )
            if errors:
                for error in errors:
                    flash(error, "error")
            return redirect(url_for("admin.user_list"))
        else:
            flash("No user IDs received.", "error")
            return redirect(url_for("admin.user_list"))
    return redirect(url_for("main.home"))


@admin.route("/del-admin-<id>", methods=["POST"])
def delete_admin(id):
    if isinstance(current_user, Admin):
        try:
            object_id = ObjectId(id)
        except Exception as e:
            flash("Invalid admin ID format.", "error")
            return redirect(url_for("admin.user_list"))
        if current_user.id == object_id:
            flash(
                "Can't Delete current Admin, Try login as different admin to delete",
                "error",
            )
            return redirect(url_for("admin.user_list"))
        else:
            admin_to_delete = Admin.objects(id=object_id).only("email").first()
            if admin_to_delete:
                admin_to_delete.delete()
                flash("Selected admin records are deleted successfully", "success")
            else:
                flash("Admin not found", "error")
        return redirect(url_for("admin.user_list"))
    return redirect(url_for("main.home"))


@admin.route("/view-question", methods=["GET"])
def view_question():
    if isinstance(current_user, Admin):
        selected_level = request.args.get("level")
        if not selected_level:
            selected_level = "1"
        choose_ques = (
            Question.objects.filter(level=selected_level) if selected_level else []
        )
        for ques in choose_ques:
            if ques.badge:
                print("hi")
                ques.badge.badge_image = return_badge_image(ques.badge.badge_image)
        return render_template(
            "admin/view_question.html",
            choose_ques=choose_ques,
            selected_level=selected_level,
        )
    return redirect(url_for("main.home"))


@admin.route("/create-question")
def create_question():
    if isinstance(current_user, Admin):
        level = request.args.get("level")
        return render_template("admin/create_question.html", level=level)
    return redirect(url_for("main.home"))


@admin.route("/view-faculty-response/<id>", methods=["POST", "GET"])
def view_faculty_response(id):
    if isinstance(current_user, Admin):
        return render_template("admin/user_response.html")
    return redirect(url_for("main.home"))


@admin.route("/add-faculty", methods=["POST"])
def add_faculty():
    if isinstance(current_user, Admin):
        existing_user = Faculty.objects(email=request.form.get("email").strip()).first()
        if existing_user is None:
            hashed_password = bcrypt.generate_password_hash(
                current_user.default_user_password
            ).decode("utf-8")
            faculty = Faculty(
                email=request.form.get("email").strip(),
                password=hashed_password,
                faculty_username=request.form.get("name").strip().lower(),
                faculty_dept=request.form.get("dept").strip(),
            )
            faculty.save()
            flash(f"Faculty added successfully", "success")
        else:
            flash(
                f"Faculty already exists, Please use a different email.",
                "error",
            )
        return redirect(url_for("admin.user_list"))
    return redirect(url_for("main.home"))


@admin.route("/get-csv-store-faculty", methods=["POST"])
def get_csv_store_faculty():
    if isinstance(current_user, Admin):
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        try:
            if file.filename.endswith(".csv"):
                df = pd.read_csv(file)
            elif file.filename.endswith(".xlsx"):
                df = pd.read_excel(file)
            else:
                return jsonify({"error": "Unsupported file format"}), 400
            if df.empty:
                if df.columns.empty:
                    return jsonify({"error": "The uploaded file is empty."}), 400
                else:
                    return (
                        jsonify(
                            {
                                "error": "The uploaded file does not contain any values; it has only columns."
                            }
                        ),
                        400,
                    )
            for col in ["email", "name", "department"]:
                if col in df.columns:
                    df[col] = df[col].astype(str).fillna("")
            required_columns = {"email", "name", "department"}
            missing_columns = required_columns - set(df.columns.str.lower())
            if missing_columns:
                return (
                    jsonify(
                        {"error": f"Missing columns: {', '.join(missing_columns)}"}
                    ),
                    400,
                )
            email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
            for index, row in df.iterrows():
                email = row["email"].strip()
                name = row["name"].strip().lower()
                dept = row["department"].strip()
                password = current_user.default_user_password
                if not re.match(email_regex, email):
                    return (
                        jsonify({"error": f"Invalid email format at row {index + 1}"}),
                        400,
                    )
                if not name:
                    return (
                        jsonify(
                            {"error": f"Missing or invalid name at row {index + 1}"}
                        ),
                        400,
                    )
                if not dept:
                    return (
                        jsonify(
                            {
                                "error": f"Missing or invalid department at row {index + 1}"
                            }
                        ),
                        400,
                    )
                existing_user = Faculty.objects(email=email).first()
                if existing_user:
                    existing_user.update(
                        set__faculty_username=name,
                        set__faculty_dept=dept,
                        set__password=bcrypt.generate_password_hash(password).decode(
                            "utf-8"
                        ),
                    )
                else:
                    hashed_password = bcrypt.generate_password_hash(password).decode(
                        "utf-8"
                    )
                    faculty = Faculty(
                        email=email,
                        password=hashed_password,
                        faculty_username=name,
                        faculty_dept=dept,
                    )
                    faculty.save()
            return (
                jsonify({"message": f"File {file.filename} processed successfully"}),
                200,
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Unauthorized access"}), 403


@admin.route("/question/update/<question_id>", methods=["POST"])
def update_question(question_id):
    try:
        data = request.json
        question = Question.objects.get(id=question_id)
        question.update(
            set__question=data["question_text"],
            set__max_marks=int(data["max_marks"]),
            set__lesson=data["lesson"],
            set__level=data["level"],
            set__correct_option=data["correct_option"],
            set__options=[
                Option(ques=opt["ques"], marks=int(opt["marks"]))
                for opt in data["options"]
            ],
        )
        question.save()
        return {"status": "success"}, 200
    except Exception as e:
        return {"status": "error", "message": str(e)}, 400


@admin.route("/update-user-default-pass/<admin_id>", methods=["POST"])
def update_pass(admin_id):
    try:
        data = request.json
        print(data)
        admin = Admin.objects.get(id=admin_id)

        admin.update(
            set__default_user_password=data["password"],
        )
        admin.save()
        return {"status": "success"}, 200
    except Exception as e:
        return {"status": "error", "message": str(e)}, 400


@admin.route("/add-badge/<question_id>", methods=["POST"])
def add_badge(question_id):
    name = request.form.get("name")
    image = request.files.get("image")

    if not name or not image:
        return (
            jsonify(
                {"success": False, "message": "Badge name and image are required!"}
            ),
            400,
        )
    badge_image = save_badge_image(image, None)
    badge = Badge(name=name, badge_image=badge_image)
    question = Question.objects(id=question_id).first()
    print(question.question)
    if not question:
        return jsonify({"success": False, "message": "Question not found!"}), 404
    question.update(set__badge=badge)
    return jsonify(
        {"success": True, "message": "Badge added to the question successfully!"}
    )


@admin.route("/edit-badge/<question_id>", methods=["POST"])
def edit_badge(question_id):
    name = request.form.get("name")
    image = request.files.get("image")
    question = Question.objects(id=question_id).first()
    if not question:
        return jsonify({"success": False, "message": "Question not found!"}), 404
    if not name:
        return jsonify({"success": False, "message": "Badge name is required!"}), 400
    badge = question.badge
    if not badge:
        return (
            jsonify(
                {"success": False, "message": "Badge not found for this question!"}
            ),
            404,
        )
    badge.name = name
    if image:
        old_image = badge.badge_image
        badge_image = save_badge_image(image,old_image)
        badge.badge_image = badge_image
    question.update(set__badge=badge)
    return jsonify({"success": True, "message": "Badge updated successfully!"})


@admin.route("/remove-badge/<question_id>", methods=["DELETE"])
def remove_badge(question_id):
    question = Question.objects(id=question_id).first()
    if not question:
        return jsonify({"success": False, "message": "Question not found!"}), 404
    if not question.badge:
        return jsonify({"success": False, "message": "No badge to remove!"}), 400
    question.update(unset__badge=True)
    return jsonify({"success": True, "message": "Badge removed successfully!"})


@admin.route("/get-graph-data")
def get_graph_data():
    users = Faculty.objects.all()
    data = {}
    for user in users:
        count = 0
        for level in user.progress:
            count += len(level.responses)
        data[user.faculty_username] = count
    return jsonify(data)
