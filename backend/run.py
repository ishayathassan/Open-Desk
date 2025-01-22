from app import create_app
from flask_cors import CORS

app = create_app()
CORS(app)  # This allows all origins by default.

if __name__ == "__main__":
    app.run(debug=True)
