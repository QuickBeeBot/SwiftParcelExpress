# ------------------------------------------------------------
# Student Registration and Login System
# Final Course Work – Group Project (Python)
# ------------------------------------------------------------
# Features:
#   - Register students with validation
#   - Login with password hashing (SHA-256)
#   - Persistent storage using JSON
#   - View, search, delete, and profile functions
#   - Uses required constructs: for loops, while loops, conditionals, file I/O, functions
# ------------------------------------------------------------

import json
import hashlib
import re
import os
from datetime import datetime

# Optional: Try to import colorama for colored output
# If not available, define minimal fallbacks (no crash)
try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    # Define minimal fallbacks to avoid AttributeError
    class Fore:
        RED = ""
        GREEN = ""
        YELLOW = ""
        CYAN = ""
        MAGENTA = ""
        WHITE = ""  # Added to fix your error
        RESET = ""
    class Style:
        BRIGHT = ""
        RESET_ALL = ""

# Data file for persistence
DATA_FILE = "students.json"


class StudentSystem:
    """
    A class to manage student registration and login.
    Stores data in a JSON file for persistence across sessions.
    """

    def __init__(self):
        """
        Initialize the system by loading existing student data.
        If data file doesn't exist, start with an empty dictionary.
        """
        self.students = self.load_data()
        self.current_user = None  # Tracks logged-in student ID

    def load_data(self):
        """
        Load student records from students.json.
        Returns a dictionary of students, keyed by student ID.
        If file is missing or invalid, returns empty dict.
        """
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r') as f:
                    data = json.load(f)
                    # Ensure data is a dictionary
                    if isinstance(data, dict):
                        return data
                    else:
                        print(Fore.YELLOW + "Warning: Data file format invalid. Starting fresh.")
                        return {}
            except (json.JSONDecodeError, IOError) as e:
                print(Fore.YELLOW + f"Warning: Could not read data file ({e}). Starting fresh.")
        return {}

    def save_data(self):
        """
        Save current student records to students.json.
        Overwrites the file with up-to-date data.
        """
        try:
            with open(DATA_FILE, 'w') as f:
                json.dump(self.students, f, indent=4)
        except IOError as e:
            print(Fore.RED + f"Error saving data: {e}")

    def hash_password(self, password):
        """
        Hash a password using SHA-256 for secure storage.
        Input: plaintext password (string)
        Output: hexadecimal hash string
        """
        return hashlib.sha256(password.encode()).hexdigest()

    def validate_email(self, email):
        """
        Validate email format using a regular expression.
        Returns True if valid, False otherwise.
        Pattern: local@domain.tld
        """
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return re.match(pattern, email) is not None

    def register(self):
        """
        Register a new student.
        Prompts for name, ID, email, and password.
        Validates inputs and prevents duplicate IDs.
        """
        print("\n" + "-" * 40)
        print("Student Registration")
        print("-" * 40)

        name = input("Enter full name: ").strip().title()
        student_id = input("Enter unique student ID: ").strip().upper()
        email = input("Enter email address: ").strip().lower()
        password = input("Set a password (minimum 6 characters): ")

        # Input validation
        if not name or not student_id or not email or not password:
            print(Fore.RED + "Error: All fields are required.")
            return

        if len(password) < 6:
            print(Fore.RED + "Error: Password must be at least 6 characters long.")
            return

        if not self.validate_email(email):
            print(Fore.RED + "Error: Invalid email format.")
            return

        if student_id in self.students:
            print(Fore.RED + f"Error: Student ID '{student_id}' is already registered.")
            return

        # Create new student record
        self.students[student_id] = {
            "name": name,
            "email": email,
            "password_hash": self.hash_password(password),
            "registered_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "login_count": 0,
            "last_login": None
        }

        self.save_data()
        print(Fore.GREEN + f"Success: Student '{name}' registered.")

    def login(self):
        """
        Authenticate a student using ID and password.
        Updates login statistics on successful login.
        """
        print("\n" + "-" * 40)
        print("Student Login")
        print("-" * 40)

        student_id = input("Student ID: ").strip().upper()
        password = input("Password: ")

        # Check existence
        if student_id not in self.students:
            print(Fore.RED + "Error: Student ID not found.")
            return

        user = self.students[student_id]

        # Verify password
        if user["password_hash"] != self.hash_password(password):
            print(Fore.RED + "Error: Incorrect password.")
            return

        # Update login metadata
        user["login_count"] += 1
        user["last_login"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.save_data()

        # Set current session user
        self.current_user = student_id
        print(Fore.GREEN + f"Success: Logged in as {user['name']}.")

    def view_all_students(self):
        """
        Display all registered students.
        Uses a for loop over dictionary items (fulfills coursework requirement).
        Shows key details: name, ID, email, registration time, login count.
        """
        print("\n" + "=" * 50)
        print("All Registered Students")
        print("=" * 50)

        if not self.students:
            print("No students registered yet.")
            return

        # For-loop demonstration (required for coursework)
        count = 1
        for student_id, data in self.students.items():
            print(f"{count}. Name: {data['name']}")
            print(f"   ID: {student_id}")
            print(f"   Email: {data['email']}")
            print(f"   Registered: {data['registered_on']}")
            print(f"   Logins: {data['login_count']}")
            print("-" * 40)
            count += 1

    def search_student(self):
        """
        Search for a student by name or ID (case-insensitive).
        Uses a for loop to iterate and match.
        """
        print("\n" + "-" * 40)
        print("Search Student")
        print("-" * 40)

        query = input("Enter name or ID to search: ").strip().lower()
        if not query:
            print("Search term cannot be empty.")
            return

        found = False
        # For-loop for search (coursework requirement)
        for student_id, data in self.students.items():
            if query in student_id.lower() or query in data["name"].lower():
                print(f"Found: {data['name']} | ID: {student_id} | Email: {data['email']}")
                found = True

        if not found:
            print("No matching student found.")

    def delete_student(self):
        """
        Delete a student by ID (admin-style function).
        Requires confirmation to prevent accidents.
        """
        print("\n" + "-" * 40)
        print("Delete Student")
        print("-" * 40)

        student_id = input("Enter Student ID to delete: ").strip().upper()
        if student_id in self.students:
            name = self.students[student_id]["name"]
            confirm = input(f"Are you sure you want to delete '{name}' (ID: {student_id})? (y/N): ").strip().lower()
            if confirm == 'y':
                del self.students[student_id]
                self.save_data()
                if self.current_user == student_id:
                    self.current_user = None
                print(f"Student '{name}' has been deleted.")
            else:
                print("Operation cancelled.")
        else:
            print("Student ID not found.")

    def view_profile(self):
        """
        Display the currently logged-in student's profile.
        Shows personal and usage statistics.
        """
        if not self.current_user:
            print("You must be logged in to view your profile.")
            return

        data = self.students[self.current_user]
        print("\n" + "-" * 40)
        print("Your Profile")
        print("-" * 40)
        print(f"Name: {data['name']}")
        print(f"Student ID: {self.current_user}")
        print(f"Email: {data['email']}")
        print(f"Registered on: {data['registered_on']}")
        print(f"Total logins: {data['login_count']}")
        print(f"Last login: {data['last_login'] if data['last_login'] else 'Never'}")

    def logout(self):
        """
        Log out the current user.
        """
        if self.current_user:
            name = self.students[self.current_user]["name"]
            print(f"Goodbye, {name}. You have been logged out.")
            self.current_user = None
        else:
            print("No user is currently logged in.")

    def run(self):
        """
        Main program loop.
        Displays menu and handles user input.
        Runs until user selects 'Exit'.
        """
        print("Welcome to the Student Registration and Login System")
        print("This system supports registration, secure login, and student management.")

        while True:
            # Display session status
            print("\n" + "=" * 50)
            if self.current_user:
                name = self.students[self.current_user]["name"]
                print(f"Status: Logged in as {name} ({self.current_user})")
            else:
                print("Status: Guest (not logged in)")
            print("=" * 50)

            # Main menu
            print("1. Register New Student")
            print("2. Login")
            print("3. View All Students")
            print("4. Search Student")
            print("5. Delete Student")
            if self.current_user:
                print("6. View My Profile")
                print("7. Logout")
            print("0. Exit")

            choice = input("\nEnter your choice (0-7): ").strip()

            # Handle menu selection
            try:
                if choice == '1':
                    self.register()
                elif choice == '2':
                    self.login()
                elif choice == '3':
                    self.view_all_students()
                elif choice == '4':
                    self.search_student()
                elif choice == '5':
                    self.delete_student()
                elif choice == '6' and self.current_user:
                    self.view_profile()
                elif choice == '7' and self.current_user:
                    self.logout()
                elif choice == '0':
                    print("\nThank you for using the Student System. Goodbye.")
                    break
                else:
                    print("Invalid choice. Please enter a number from the menu.")
            except KeyboardInterrupt:
                print("\n\nProgram interrupted. Exiting.")
                break
            except Exception as e:
                print(f"An unexpected error occurred: {e}")


# Entry point: only run if script is executed directly
if __name__ == "__main__":
    system = StudentSystem()
    system.run()