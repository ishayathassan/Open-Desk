# OpenDesk

OpenDesk is a university community platform designed to connect students, faculty, and alumni. It enables users to create and join channels, share information, and engage with their academic community.

## Features

### Core Features

- **User Authentication**: Secure signup, login, and profile management.
- **Channels**:
  - Public and private channels.
  - Channel-specific rules, bios, and post management.
- **University Information**:
  - Detailed university profiles with ratings and reviews.
  - Departments and their respective information.
- **Custom User Profiles**:
  - Fields for university, program, year of study, bio, and profile images.

### APIs

- **Signup API**: Allow new users to register with personal and university information.
- **Channel Management API**: CRUD operations for channels.
- **University Info API**: Access and manage university profiles, ratings, and departments.

## Models

### User Model

Custom user model with fields:

- `university`
- `program`
- `year_of_study`
- `full_name`
- `profile_image`
- `bio`
- `is_anonymous`
- `has_reviewed`

### Channels

- `channel_id`: Unique identifier.
- `name`: Channel name.
- `slug`: URL-friendly identifier.
- `logo_image`: Image for the channel logo.
- `cover_image`: Background image for the channel.
- `bio`: Description of the channel.
- `rules`: Channel rules.
- `follow_count` and `post_count`: Metrics.
- `type`: Public or private.
- `short_form`: Abbreviation for the channel name.
- `is_private`: Boolean for channel privacy.

### University

- `uni_id`: Unique identifier.
- `name`: University name.
- `logo_image`: University logo.
- `no_of_reviews`: Number of reviews.
- `avg_career_growth`, `avg_uni_culture`, `avg_resources`, `avg_cocurriculars`, `avg_alumni`: Averages for different metrics.
- `uni_rating`: Overall rating.

### Private Channel

- `channel_id`: ForeignKey to `Channels`.
- `uni_id`: ForeignKey to `University`.

### Overview

- `overview_id`: Unique identifier.
- `website_url`: Official website.
- `location`: University location.
- `about`: Description.
- `department_id`: ForeignKey to `Departments`.
- `uni_id`: ForeignKey to `University`.

### Departments

- `department_id`: Unique identifier.
- `department_name`: Name of the department.

## Installation

### Prerequisites

- Python 3.13+
- Flask
- MySQL database

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/opendesk.git
   cd opendesk
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the database in `settings.py`.
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Testing APIs

You can test the APIs using Postman or cURL.

### Example: Signup API

#### Request

```bash
curl -X POST http://127.0.0.1:8000/api/signup/ \
-H "Content-Type: application/json" \
-d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "securepassword",
    "university": "Example University",
    "program": "Computer Science",
    "year_of_study": 3,
    "full_name": "Test User",
    "bio": "I am a test user for OpenDesk.",
    "is_anonymous": false,
    "has_reviewed": false
}'
```

## Project Structure

```
OpenDesk/
├── backend/
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── frontend/
│   └── React components for the user interface
├── requirements.txt
└── README.md
```

## Contributing

1. Fork the repository.
2. Create a new branch for your feature/bugfix.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.

---

Happy Coding!
