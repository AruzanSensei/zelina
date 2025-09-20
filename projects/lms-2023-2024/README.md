# LMS Web Version

A web-based version of the Learning Management System that maintains the same functionality as the original Python program but with a modern web interface.

## Features

- View all classes and their students
- Random student selection
- Modern, responsive UI
- Real-time updates

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Select a class from the grid of available classes
2. View the complete student list for the selected class
3. Use the "Pick Random Student" button to randomly select a student from the current class

## Technologies Used

- Flask (Python web framework)
- Bootstrap 5 (UI framework)
- Font Awesome (icons)
- JavaScript (frontend interactivity) 