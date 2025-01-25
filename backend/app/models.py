from app.database import db
from sqlalchemy.sql import func

class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    university = db.Column(db.String(100), nullable=False)
    program = db.Column(db.String(100), nullable=False)
    year_of_study = db.Column(db.Integer, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    profile_picture = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False, nullable=False)
    has_reviewed = db.Column(db.Boolean, default=False, nullable=False)


# Channels Table
class Channel(db.Model):
    __tablename__ = 'channels'
    
    channel_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    logo_image = db.Column(db.String(255))
    cover_image = db.Column(db.String(255))
    bio = db.Column(db.Text)
    rules = db.Column(db.Text)
    follow_count = db.Column(db.Integer, default=0)
    post_count = db.Column(db.Integer, default=0)
    type = db.Column(db.String(50))
    short_form = db.Column(db.String(50))
    is_private = db.Column(db.Boolean, default=False)

class HighlightedPosts(db.Model):
    __tablename__ = 'highlighted_posts'
    
    post_id = db.Column(db.Integer, db.ForeignKey('posts.post_id'), primary_key=True, nullable=False)
    channel_id = db.Column(db.Integer, db.ForeignKey('channels.channel_id'), primary_key=True, nullable=False)

    # Relationships
    post = db.relationship('Post', backref='highlighted_in_channels', lazy=True)
    channel = db.relationship('Channel', backref='highlighted_posts', lazy=True)

    def __repr__(self):
        return f"<HighlightedPosts post_id={self.post_id} channel_id={self.channel_id}>"

# University Table
class University(db.Model):
    __tablename__ = 'university'
    
    uni_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    logo_image = db.Column(db.String(255))
    no_of_reviews = db.Column(db.Integer, default=0)
    avg_career_growth = db.Column(db.Float, default=0.0)
    avg_uni_culture = db.Column(db.Float, default=0.0)
    avg_resources = db.Column(db.Float, default=0.0)
    avg_cocurriculars = db.Column(db.Float, default=0.0)
    avg_alumni = db.Column(db.Float, default=0.0)
    uni_rating = db.Column(db.Float, default=0.0)

# Private Channel Table
class PrivateChannel(db.Model):
    __tablename__ = 'private_channel'
    
    channel_id = db.Column(db.Integer, db.ForeignKey('channels.channel_id'), primary_key=True)
    uni_id = db.Column(db.Integer, db.ForeignKey('university.uni_id'), primary_key=True)

# Overview Table
class Overview(db.Model):
    __tablename__ = 'overview'
    
    overview_id = db.Column(db.Integer, primary_key=True)
    website_url = db.Column(db.String(255))
    location = db.Column(db.String(255))
    about = db.Column(db.Text)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.department_id'))
    uni_id = db.Column(db.Integer, db.ForeignKey('university.uni_id'))

# Departments Table
class Department(db.Model):
    __tablename__ = 'departments'
    
    department_id = db.Column(db.Integer, primary_key=True)
    department_name = db.Column(db.String(200), nullable=False)
    
# Interests Table
class Interest(db.Model):
    __tablename__ = 'interests'

    interest_id = db.Column(db.Integer, primary_key=True)
    interests = db.Column(db.String(255), nullable=False)

# User Interests Table
class UserInterest(db.Model):
    __tablename__ = 'user_interests'

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    interest_id = db.Column(db.Integer, db.ForeignKey('interests.interest_id'), primary_key=True)

# Followed Channels Table
class FollowedChannel(db.Model):
    __tablename__ = 'followed_channels'

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    channel_id = db.Column(db.Integer, db.ForeignKey('channels.channel_id'), primary_key=True)

# Channel Admins Table
class ChannelAdmin(db.Model):
    __tablename__ = 'channel_admins'

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    channel_id = db.Column(db.Integer, db.ForeignKey('channels.channel_id'), primary_key=True)

# Posts Table
class Post(db.Model):
    __tablename__ = 'posts'

    post_id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    upvote_counts = db.Column(db.Integer, default=0)
    downvote_counts = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    channel_id = db.Column(db.Integer, db.ForeignKey('channels.channel_id'), nullable=False)
    
    # Define relationships
    user = db.relationship('User', backref='posts')
    channel = db.relationship('Channel', backref='posts')

# Votes Table
class Vote(db.Model):
    __tablename__ = 'votes'

    vote_id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # e.g., 'upvote' or 'downvote'
    created_at = db.Column(db.DateTime, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.post_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

# Tags Table
class Tag(db.Model):
    __tablename__ = 'tags'

    tag_id = db.Column(db.Integer, primary_key=True)
    tag_name = db.Column(db.String(255), nullable=False)

# Post Tags Table
class PostTag(db.Model):
    __tablename__ = 'post_tags'

    post_id = db.Column(db.Integer, db.ForeignKey('posts.post_id'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.tag_id'), primary_key=True)

# Saved Posts Table
class SavedPost(db.Model):
    __tablename__ = 'saved_posts'

    savepost_id = db.Column(db.Integer, primary_key=True)
    saved_at = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.post_id'), nullable=False)

# Comments Table
class Comment(db.Model):
    __tablename__ = 'comments'

    comment_id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.comment_id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.post_id'), nullable=False)

# Channel Tags Table
class ChannelTag(db.Model):
    __tablename__ = 'channel_tags'

    channel_id = db.Column(db.Integer, db.ForeignKey('channels.channel_id'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.tag_id'), primary_key=True)


class Rating(db.Model):
    __tablename__ = 'rating'
    
    unirating_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    career_growth = db.Column(db.Float, nullable=False)
    uni_culture = db.Column(db.Float, nullable=False)
    resources = db.Column(db.Float, nullable=False)
    co_curriculars = db.Column(db.Float, nullable=False)
    alumni = db.Column(db.Float, nullable=False)
    comments = db.Column(db.Text, nullable=True)
    uni_id = db.Column(db.Integer, db.ForeignKey('university.uni_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

    # Relationships
    university = db.relationship('University', backref='ratings', lazy=True)
    user = db.relationship('User', backref='ratings', lazy=True)

    def __repr__(self):
        return f"<Rating unirating_id={self.unirating_id} uni_id={self.uni_id} user_id={self.user_id}>"
