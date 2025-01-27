from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from app.models import User,Department,University, Channel, FollowedChannel, Post, Vote, Comment, Overview, Rating
from app.database import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

bp = Blueprint('routes', __name__)


def get_authenticated_user_id():
    # Get user_id from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        # Expecting format: "Bearer <user_id>"
        _, user_id = auth_header.split()
        return int(user_id)
    except (ValueError, IndexError, TypeError):
        return None

@bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        print("Received data:", data)  # Log the received data for debugging

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        university_id = data.get('university_id')  # Get university_id instead of university name

        # Basic validation
        if not username or not email or not password or not university_id:
            return jsonify({"error": "All fields are required"}), 400

        # Check if the provided university_id exists
        university = University.query.get(university_id)
        if not university:
            return jsonify({"error": "Invalid university ID"}), 400

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
            university_id=university_id,  # Use university_id instead of university name
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
    result = [{"uni_id": uni.uni_id, "name": uni.name} for uni in universities]
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
            "email": user.email,
            "university_id": user.university_id,  # Use university_id instead of university
        }), 200

    except Exception as e:
        print("Error during login:", e)
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
        posts = (
            db.session.query(Post)
            .options(joinedload(Post.user), joinedload(Post.channel))
            .order_by(Post.created_at.desc())  # Order by created_at in descending order
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
                "channel_name": post.channel.name if post.channel else None,
                "channel_id": post.channel.channel_id if post.channel else None,
                "university_id": post.university.uni_id if post.university else None,
                "user": {
                    "username": post.user.username if post.user else None,
                    "institute": post.user.university.name if post.user and post.user.university else None,
                }
            })

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@bp.route('/create_post', methods=['POST'])
def create_post():
    try:
        data = request.get_json()
        print("Received data:", data)

        user_id = data.get('user_id')
        content = data.get('content')
        channel_id = data.get('channel_id')
        uni_id = data.get('university_id')  # Use uni_id here to match the model

        # Validate required fields
        if not all([user_id, content, channel_id, uni_id]):
            print("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            print(f"User not found: user_id={user_id}")
            return jsonify({"error": "User not found"}), 404

        # Check if university exists
        university = University.query.get(uni_id)
        if not university:
            print(f"University not found: uni_id={uni_id}")
            return jsonify({"error": "University not found"}), 404

        # Check if channel exists
        channel = Channel.query.get(channel_id)
        if not channel:
            print(f"Channel not found: channel_id={channel_id}")
            return jsonify({"error": "Channel not found"}), 404

        # For private channels, ensure user is a member
        if channel.is_private:
            membership = FollowedChannel.query.filter_by(
                user_id=user_id,
                channel_id=channel_id
            ).first()
            if not membership:
                print(f"User is not a member of the private channel: user_id={user_id}, channel_id={channel_id}")
                return jsonify({"error": "Not a member of this private channel"}), 403

        # Create the new post
        new_post = Post(
            content=content,
            user_id=user_id,
            channel_id=channel_id,
            uni_id=uni_id,  # Use uni_id here to match the model
            created_at=datetime.utcnow()
        )
        print("New post created:", new_post)

        # Update the channel's post count
        channel.post_count = (channel.post_count or 0) + 1
        print(f"Updated channel post count: {channel.post_count}")

        # Commit to the database
        db.session.add(new_post)
        db.session.commit()
        print("Post committed to the database successfully")

        return jsonify({
            "message": "Post created successfully",
            "post_id": new_post.post_id
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        print("Database error:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500
    except Exception as e:
        print("Unexpected error:", str(e))
        return jsonify({"error": "Unexpected error occurred"}), 500

@bp.route('/posts/<int:post_id>', methods=['GET'])
def get_single_post(post_id):
    try:
        post = Post.query.options(joinedload(Post.user), joinedload(Post.channel)).get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Serialize the post like in the home route
        serialized_post = {
            "id": post.post_id,
            "content": post.content,
            "upvote_counts": post.upvote_counts,
            "downvote_counts": post.downvote_counts,
            "created_at": post.created_at.isoformat(),
            "channel_name": post.channel.name if post.channel else None,
            "channel_id": post.channel.channel_id if post.channel else None,
            "user": {
                "username": post.user.username if post.user else None,
                "institute": post.user.university.name if post.user and post.user.university else None,  # Make sure to extract the necessary attribute
                "user_id": post.user.user_id if post.user else None,
        }
}

        return jsonify(serialized_post), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route('/posts/<int:post_id>/vote', methods=['GET'])
def get_user_vote(post_id):
    user_id = get_authenticated_user_id()  # Implement your auth check
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    vote = Vote.query.filter_by(
        post_id=post_id,
        user_id=user_id
    ).first()

    return jsonify({
        "vote_type": vote.type if vote else None
    }), 200

@bp.route('/posts/<int:post_id>/vote', methods=['POST'])
def handle_vote(post_id):
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    vote_type = data.get('vote_type')
    
    if vote_type not in ['upvote', 'downvote']:
        return jsonify({"error": "Invalid vote type"}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    # Check existing vote
    existing_vote = Vote.query.filter_by(
        post_id=post_id,
        user_id=user_id
    ).first()

    response_data = {}
    
    try:
        if existing_vote:
            # User is changing/canceling vote
            if existing_vote.type == vote_type:
                # Cancel vote
                db.session.delete(existing_vote)
                if vote_type == 'upvote':
                    post.upvote_counts -= 1
                else:
                    post.downvote_counts -= 1
                response_data['new_vote_status'] = None
            else:
                # Change vote type
                existing_vote.type = vote_type
                if vote_type == 'upvote':
                    post.upvote_counts += 1
                    post.downvote_counts -= 1
                else:
                    post.downvote_counts += 1
                    post.upvote_counts -= 1
                response_data['new_vote_status'] = vote_type
        else:
            # New vote
            new_vote = Vote(
                type=vote_type,
                post_id=post_id,
                user_id=user_id,
                created_at=datetime.utcnow()
            )
            db.session.add(new_vote)
            if vote_type == 'upvote':
                post.upvote_counts += 1
            else:
                post.downvote_counts += 1
            response_data['new_vote_status'] = vote_type

        db.session.commit()
        response_data.update({
            "new_upvotes": post.upvote_counts,
            "new_downvotes": post.downvote_counts
        })
        return jsonify(response_data), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        comments = Comment.query.options(
            joinedload(Comment.user)  # Now works because relationship exists
        ).filter_by(post_id=post_id, parent_id=None).all()

        # In get_comments route
        serialized = [{
            "comment_id": c.comment_id,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "user": {
                "user_id": c.user.user_id,  # Add this line
                "username": c.user.username,
                "avatar": c.user.profile_picture or "/images/user.png"
            }
        } for c in comments]

        return jsonify(serialized), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    try:
        user_id = get_authenticated_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        content = data.get('content')
        parent_id = data.get('parent_id')

        if not content:
            return jsonify({"error": "Comment content is required"}), 400

        new_comment = Comment(
            content=content,
            post_id=post_id,
            user_id=user_id,
            parent_id=parent_id,
            created_at=datetime.utcnow()
        )

        db.session.add(new_comment)
        db.session.commit()

        # Get the user details
        user = User.query.get(user_id)

        return jsonify({
            "comment_id": new_comment.comment_id,
            "content": new_comment.content,
            "created_at": new_comment.created_at.isoformat(),
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "avatar": user.profile_picture or "/images/user.png"
            }
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@bp.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    try:
        user_id = get_authenticated_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        if comment.user_id != user_id:
            return jsonify({"error": "Unauthorized to delete this comment"}), 403

        db.session.delete(comment)
        db.session.commit()

        return jsonify({"message": "Comment deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    try:
        user_id = get_authenticated_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        post = Post.query.get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        if post.user_id != user_id:
            return jsonify({"error": "Unauthorized to delete this post"}), 403

        # Manually delete related votes
        Vote.query.filter_by(post_id=post_id).delete()

        # Now delete the post
        db.session.delete(post)
        db.session.commit()

        return jsonify({"message": "Post deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Update Post
@bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    try:
        user_id = get_authenticated_user_id()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        post = Post.query.get(post_id)
        if not post:
            return jsonify({"error": "Post not found"}), 404

        if post.user_id != user_id:
            return jsonify({"error": "Unauthorized to edit this post"}), 403

        data = request.get_json()
        new_content = data.get('content')
        
        if not new_content:
            return jsonify({"error": "Content is required"}), 400

        post.content = new_content
        post.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Post updated successfully",
            "content": post.content,
            "updated_at": post.updated_at.isoformat()
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@bp.route('/channels/<int:channel_id>', methods=['GET'])
def get_channel(channel_id):
    try:
        channel = Channel.query.get_or_404(channel_id)
        return jsonify({
            "channel_id": channel.channel_id,
            "name": channel.name,
            "logo_image": channel.logo_image,
            "cover_image": channel.cover_image,
            "follow_count": channel.follow_count,
            "post_count": channel.post_count,
            "bio": channel.bio,
            "rules": channel.rules
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/channels/<int:channel_id>/posts', methods=['GET'])
def get_channel_posts(channel_id):
    try:
        posts = (
            Post.query.filter_by(channel_id=channel_id)
            .options(joinedload(Post.user))
            .all()
        )

        return jsonify([{
            "id": post.post_id,
            "content": post.content,
            "upvote_counts": post.upvote_counts,
            "downvote_counts": post.downvote_counts,
            "created_at": post.created_at.isoformat(),
            "user": {
                "username": post.user.username,
                "institute": post.user.university.name if post.user.university else None,  # Extract name or other field
            }
        } for post in posts]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/channels/<int:channel_id>/follow', methods=['POST', 'DELETE'])
def follow_channel(channel_id):
    user_id = request.headers.get('X-User-ID')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    channel = Channel.query.get(channel_id)
    if not channel:
        return jsonify({"error": "Channel not found"}), 404

    if request.method == 'POST':  # Follow the channel
        # Check if already followed
        if FollowedChannel.query.filter_by(user_id=user_id, channel_id=channel_id).first():
            return jsonify({"message": "Already following this channel"}), 400
        
        followed_channel = FollowedChannel(user_id=user_id, channel_id=channel_id)
        db.session.add(followed_channel)
        
        if channel.follow_count is None:
            channel.follow_count = 0
        channel.follow_count += 1
        
        db.session.commit()
        return jsonify({"message": "Successfully followed the channel"}), 200

    elif request.method == 'DELETE':  # Unfollow the channel
        followed_channel = FollowedChannel.query.filter_by(user_id=user_id, channel_id=channel_id).first()
        if not followed_channel:
            return jsonify({"message": "You are not following this channel"}), 400
        
        db.session.delete(followed_channel)
        
        if channel.follow_count is None:
            channel.follow_count = 0
        channel.follow_count = max(0, channel.follow_count - 1)  # Prevent negative follow counts
        
        db.session.commit()
        return jsonify({"message": "Successfully unfollowed the channel"}), 200

@bp.route('/channels/<int:channel_id>/follow-status', methods=['GET'])
def follow_status(channel_id):
    username = request.args.get('username')  # Extract username from query parameter
    if not username:
        return jsonify({"error": "Username is required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the user is following the channel
    is_following = FollowedChannel.query.filter_by(user_id=user.user_id, channel_id=channel_id).first() is not None

    return jsonify({
        "channel_id": channel_id,
        "username": username,
        "follow_status": "Following" if is_following else "Not Following"
    })

@bp.route('/universities/<int:uni_id>', methods=['GET'])
def get_university(uni_id):
    try:
        university = University.query.get_or_404(uni_id)
        
        # Fetch the related Overview and Department
        overview = university.overview  # Access the related Overview
        department = overview.department if overview else None  # Access the related Department
        
        return jsonify({
            "uni_id": university.uni_id,
            "name": university.name,
            "logo_image": university.logo_image,
            "no_of_reviews": university.no_of_reviews,
            "avg_career_growth": university.avg_career_growth,
            "avg_uni_culture": university.avg_uni_culture,
            "avg_resources": university.avg_resources,
            "avg_cocurriculars": university.avg_cocurriculars,
            "avg_alumni": university.avg_alumni,
            "uni_rating": university.uni_rating,
            "overview": {
                "website_url": overview.website_url if overview else None,
                "location": overview.location if overview else None,
                "about": overview.about if overview else None,
                "department_name": department.department_name if department else None
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@bp.route('/universities/<int:uni_id>/posts', methods=['GET'])
def get_university_posts(uni_id):
    try:
        # Fetch posts where the user's university matches the given uni_id
        posts = (
            db.session.query(Post)
            .join(User, Post.user_id == User.user_id)
            .filter(User.university_id == uni_id)  # Filter directly by university_id field
            .options(joinedload(Post.user))
            .all()
        )

        return jsonify([{
            "id": post.post_id,
            "content": post.content,
            "upvote_counts": post.upvote_counts,
            "downvote_counts": post.downvote_counts,
            "created_at": post.created_at.isoformat(),
            "user": {
                "username": post.user.username,
                "institute": post.user.university.name if post.user.university else None,
            }
        } for post in posts]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@bp.route('/universities/<int:uni_id>/reviews', methods=['GET'])
def get_reviews(uni_id):
    try:
        # Fetch reviews related to the university
        reviews = Rating.query.filter_by(uni_id=uni_id).all()
        
        if not reviews:
            return jsonify({"message": "No reviews found for this university"}), 404
        
        review_list = []
        for review in reviews:
            review_data = {
                "rating": review.career_growth,
                "comments": review.comments,
                "user_id": review.user_id,
                "username": review.user.username,
            }
            review_list.append(review_data)
        
        return jsonify({"reviews": review_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route('/channels', methods=['GET'])
def get_all_channels():
    try:
        # Fetch all channels from the database, ordered by channel_id descending
        channels = Channel.query.order_by(Channel.channel_id.desc()).all()

        # Serialize the channel data
        channels_data = [
            {
                "channel_id": channel.channel_id,
                "name": channel.name,
                "slug": channel.slug,
                "logo_image": channel.logo_image,
                "cover_image": channel.cover_image,
                "bio": channel.bio,
                "rules": channel.rules,
                "follow_count": channel.follow_count,
                "post_count": channel.post_count,
                "type": channel.type,
                "short_form": channel.short_form,
                "is_private": channel.is_private,
            }
            for channel in channels
        ]

        return jsonify(channels_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
