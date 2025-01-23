from flask import Flask
from flask_migrate import Migrate
from app.database import db

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:admin123@localhost/opendesk'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    Migrate(app, db)  # Initialize Flask-Migrate

    from app.models import (
    User,
    Channel,
    Post,
    University,
    Interest,
    UserInterest,
    FollowedChannel,
    ChannelAdmin,
    Vote,
    Tag,
    PostTag,
    ChannelTag,
    SavedPost,
    Comment,
    PrivateChannel,
    Rating,
    HighlightedPosts,
    Department,
    Overview,
)

    with app.app_context():
        db.create_all()

    from app.routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    return app
