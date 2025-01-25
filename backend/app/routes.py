from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from app.models import User,Department,University, Channel, FollowedChannel, Post
from app.database import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

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


@bp.route('/followed_channels', methods=['GET'])
def get_followed_channels():
    try:
        # Get the user_id from the query parameters or request body
        user_id = request.args.get("user_id")  # From query parameter
        if not user_id:
            data = request.get_json()  # If sent in the body
            user_id = data.get("user_id")

        # Validate user_id
        if not user_id:
            return jsonify({"status": "error", "message": "User ID is required"}), 400

        # Query to fetch the channels followed by the user
        followed_channels = (
            db.session.query(Channel.channel_id, Channel.name, Channel.slug)
            .join(FollowedChannel, Channel.channel_id == FollowedChannel.channel_id)
            .filter(FollowedChannel.user_id == user_id)
            .all()
        )

        # Prepare response data
        channels = [
            {"id": channel.channel_id, "name": channel.name, "slug": channel.slug}
            for channel in followed_channels
        ]

        return jsonify({"status": "success", "channels": channels}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



@bp.route('/', methods=['GET'])
def home():
    try:
        # Load both User and Channel relationships
        posts = (
            db.session.query(Post)
            .options(joinedload(Post.user), joinedload(Post.channel))
            .all()
        )

        response = []
        for post in posts:
            response.append({
                "id": post.post_id,
                "content": post.content,
                "upvote_counts": post.upvote_counts,
                "downvote_counts": post.downvote_counts,
                "created_at": post.created_at.isoformat(),
                "category": post.channel.name,  # Use channel's name as category
                "user": {
                    "username": post.user.username,
                    "institute": post.user.university,
                }
            })

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route('/create_post', methods=['POST'])
def create_post():
    data = request.get_json()
    user_id = data.get('user_id')
    content = data.get('content')
    channel_id = data.get('channel_id')

    # Validate required fields
    if not all([user_id, content, channel_id]):
        return jsonify({"error": "Missing user_id, content, or channel_id"}), 400

    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if channel exists
    channel = Channel.query.get(channel_id)
    if not channel:
        return jsonify({"error": "Channel not found"}), 404

    # For private channels, ensure the user is a member
    if channel.is_private:
        membership = FollowedChannel.query.filter_by(
            user_id=user_id,
            channel_id=channel_id
        ).first()
        if not membership:
            return jsonify({"error": "Not a member of this private channel"}), 403

    # Create the new post
    new_post = Post(
        content=content,
        user_id=user_id,
        channel_id=channel_id,
        created_at=datetime.utcnow()
    )

    # Update the channel's post count
    if channel.post_count is None:
        channel.post_count = 0  # Initialize to 0 if None
    channel.post_count += 1

    try:
        db.session.add(new_post)
        db.session.commit()
        return jsonify({
            "message": "Post created successfully",
            "post_id": new_post.post_id
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
