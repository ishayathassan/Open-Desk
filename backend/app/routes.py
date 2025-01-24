from flask import Blueprint, request, jsonify
from app.models import User,Department,University
from app.database import db

bp = Blueprint('routes', __name__)

@bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        print("Received data:", data)  # Log the received data for debugging

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Basic validation
        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        # Check for existing user
        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            if existing_user.email == email:
                return jsonify({"error": "Email is already registered"}), 400
            if existing_user.username == username:
                return jsonify({"error": "Username is already taken"}), 400

        # Create and save new user
        new_user = User(
            username=username,
            email=email,
            password=password,
            university=data.get('university'),
            program=data.get('program'),
            year_of_study=data.get('year_of_study'),
            full_name=data.get('full_name'),
            profile_picture=data.get('profile_picture'),
            bio=data.get('bio')
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully!", "user_id": new_user.user_id})

    except Exception as e:
        print("Error occurred:", e)  # Log the exception for debugging
        return jsonify({"error": "An error occurred. Please try again."}), 500


@bp.route('/universities', methods=['GET'])
def get_universities():
    # Fetch only the names of universities
    universities = University.query.with_entities(University.uni_id, University.name).all()
    result = [{"id": uni.uni_id, "name": uni.name} for uni in universities]
    return jsonify(result)

@bp.route('/programs', methods=['GET'])
def get_programs():
    # Fetch only the names of programs (departments)
    programs = Department.query.with_entities(Department.department_id, Department.department_name).all()
    result = [{"id": prog.department_id, "name": prog.department_name} for prog in programs]
    return jsonify(result)

@bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        # Basic validation
        if not email or not password:
            return jsonify({"error": "Email and Password are required"}), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"error": "Invalid email"}), 401  # Email not found

        # Verify the password
        if user.password != password:
            return jsonify({"error": "Incorrect password"}), 401  # Wrong password


        return jsonify({
            "message": "Login successful!",
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email
        }), 200

    except Exception as e:
        print("Error during login:", e)  # Debugging
        return jsonify({"error": "An error occurred. Please try again later."}), 500
    
@bp.route("/logout", methods=["POST"])
def logout():
    try:
        return jsonify({"message": "Logout successful!"}), 200
    except Exception as e:
        print("Error during logout:", e)  # Debugging
        return jsonify({"error": "An error occurred. Please try again later."}), 500

