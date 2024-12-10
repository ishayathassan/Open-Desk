from flask import Flask, render_template, request, redirect, flash, url_for, session
from werkzeug.security import check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime,timezone
import re

app = Flask(__name__)


# MySQL database configuration
app.secret_key = 'QwertY12345'  # Required for flashing messages
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:admin123@localhost/opendesk'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db initialization
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    institute = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'
    
class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    like_count = db.Column(db.Integer, default=0, nullable=False)
    comment_count = db.Column(db.Integer, default=0, nullable=False)
    view_count = db.Column(db.Integer, default=0, nullable=False)
    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def __repr__(self):
        return f'<Post {self.title}>'

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        category = request.form['category']
        created_at = datetime.now(timezone.utc)
        user_id = session['user_id']

        # Create a new post instance and save to the database
        new_post = Post(
            title=title,
            content=content,
            category=category,
            created_at=created_at,
            user_id=user_id,
            like_count=0,
            comment_count=0,
            view_count=0
        )
        db.session.add(new_post)
        db.session.commit()

        flash('Post created successfully!', 'success')
        return redirect(url_for('home'))  # Redirect to reload the page

    # Retrieve posts from the database
    posts = Post.query.all()  # Querying all posts
    return render_template('home.html', posts=posts)


@app.route('/signup',methods=['GET','POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        username = request.form['username']
        password1 = request.form['password1']
        password2 = request.form['password2']
        institute = request.form['Institute']
        department = request.form['department']

        errors = {}

        # Validate email
        email_pattern = r'^[^@]+@[^@]+\.(edu|ac)(\.[a-z]+)*$'
        if not re.match(email_pattern, email):
            errors['email'] = "Email must be an institutional email."
        
        # Check if username is unique
        if User.query.filter_by(username=username).first():
            errors['username'] = "Username is already taken."
        
        # Validate password strength
        if len(password1) < 8 or not re.search(r'[A-Z]', password1) or not re.search(r'[0-9]', password1):
            errors['password1'] = "Password must be at least 8 characters, include a number and an uppercase letter."
        
        # Check if passwords match
        if password1 != password2:
            errors['password2'] = "Passwords do not match."

        # If errors exist, re-render the form with error messages
        if errors:
            return render_template("signup.html", errors=errors, form_data=request.form)

        # If no errors, save the user and redirect to login
        new_user = User(
            email=email,
            username=username,
            password=password1,  # Ideally, hash the password before saving
            institute=institute,
            department=department
        )
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))

    return render_template("signup.html")

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        errors = {}

        # Find the user by username
        user = User.query.filter_by(username=username).first()

        if not user:
            errors['username'] = "Username does not exist."
        elif user.password != password:
            errors['password'] = "Incorrect password."

        # If errors exist, re-render the form with error messages
        if errors:
            return render_template("login.html", errors=errors, form_data=request.form)

        # If no errors, login the user (e.g., create a session)
        session['user_id'] = user.id
        session['username'] = user.username
        flash('Login successful!', 'success')
        return redirect(url_for('home'))

    return render_template("login.html")

@app.route('/logout')
def logout():
    # Clear the session
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('login'))


with app.app_context():
    db.create_all()
    print("Tables created!")
    
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5555,debug=True)