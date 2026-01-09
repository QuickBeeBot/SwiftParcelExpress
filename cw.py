import json
import hashlib
import re
import os
from datetime import datetime

# Optional: Add color for readability (install via `pip install colorama` if needed)
try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    # Fallback if colorama not available
    class Fore: RED = GREEN = YELLOW = RESET = ''
    class Style: BRIGHT = RESET_ALL = ''

# File to store student data
DATA_FILE = "students.json"

class StudentSystem:
    def __init__(self):
        self.students = self.load_data()
        self.current_user = None

    def load_data(self):
        """Load students from JSON file; create empty if not exists."""
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                print(Fore.YELLOW + "⚠️  Corrupted or missing data file. Starting fresh.")
        return {}

    def save_data(self):
        """Save students to JSON file."""
        with open(DATA_FILE, 'w') as f:
            json.dump(self.students, f, indent=4)

    def hash_password(self, password):
        """Hash password using SHA-256."""
        return hashlib.sha256(password.encode()).hexdigest()

    def validate_email(self, email):
        """Check if email is valid using regex."""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return re.match(pattern, email) is not None

    def register(self):
        print(f"\n{Fore.CYAN}{'='*40}")
        print(f"{Fore.CYAN}🎓 Student Registration")
        print(f"{Fore.CYAN}{'='*40}")

        name = input("Enter full name: ").strip().title()
        student_id = input("Enter unique student ID: ").strip().upper()
        email = input("Enter email: ").strip().lower()
        password = input("Set a password (min 6 chars): ")

        # Validation
        if not all([name, student_id, email, password]):
            print(Fore.RED + "❌ All fields are required.")
            return

        if len(password) < 6:
            print(Fore.RED + "❌ Password must be at least 6 characters.")
            return

        if not self.validate_email(email):
            print(Fore.RED + "❌ Invalid email format.")
            return

        if student_id in self.students:
            print(Fore.RED + f"❌ Student ID '{student_id}' already exists.")
            return

        # Register new student
        self.students[student_id] = {
            "name": name,
            "email": email,
            "password_hash": self.hash_password(password),
            "registered_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "login_count": 0,
            "last_login": None
        }

        self.save_data()
        print(Fore.GREEN + f"✅ Student '{name}' registered successfully!")

    def login(self):
        print(f"\n{Fore.BLUE}{'='*40}")
        print(f"{Fore.BLUE}🔐 Student Login")
        print(f"{Fore.BLUE}{'='*40}")

        student_id = input("Student ID: ").strip().upper()
        password = input("Password: ")

        if student_id not in self.students:
            print(Fore.RED + "❌ Student ID not found.")
            return

        user = self.students[student_id]
        if user["password_hash"] != self.hash_password(password):
            print(Fore.RED + "❌ Incorrect password.")
            return

        # Update login stats
        user["login_count"] += 1
        user["last_login"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.save_data()

        self.current_user = student_id
        name = user["name"]
        print(Fore.GREEN + f"✅ Welcome back, {name}! (Logins: {user['login_count']})")

    def view_all_students(self):
        print(f"\n{Fore.MAGENTA}{'='*50}")
        print(f"{Fore.MAGENTA}📋 All Registered Students")
        print(f"{Fore.MAGENTA}{'='*50}")

        if not self.students:
            print(Fore.YELLOW + "📭 No students registered yet.")
            return

        # Demonstrate FOR LOOP over dictionary items — required for coursework!
        for idx, (sid, data) in enumerate(self.students.items(), 1):
            print(f"{Fore.WHITE}{idx}. {Fore.CYAN}{data['name']}")
            print(f"   ID: {Fore.YELLOW}{sid} | Email: {data['email']}")
            print(f"   Registered: {data['registered_on']} | Logins: {data['login_count']}")
            print("-" * 50)

    def search_student(self):
        print(f"\n{Fore.GREEN}{'='*40}")
        print(f"{Fore.GREEN}🔍 Search Student")
        print(f"{Fore.GREEN}{'='*40}")

        query = input("Enter name or ID to search: ").strip().lower()
        if not query:
            print(Fore.YELLOW + "⚠️  Search term cannot be empty.")
            return

        found = False
        # FOR LOOP: iterate & match case-insensitively
        for sid, data in self.students.items():
            if query in sid.lower() or query in data["name"].lower():
                print(Fore.CYAN + f"✅ Found: {data['name']} | ID: {sid} | Email: {data['email']}")
                found = True

        if not found:
            print(Fore.RED + "❌ No matching student found.")

    def delete_student(self):
        print(f"\n{Fore.RED}{'='*40}")
        print(f"{Fore.RED}🗑️  Delete Student (Admin Only)")
        print(f"{Fore.RED}{'='*40}")

        sid = input("Enter Student ID to delete: ").strip().upper()
        if sid in self.students:
            name = self.students[sid]["name"]
            confirm = input(f"⚠️  Permanently delete '{name}' (ID: {sid})? (y/N): ").strip().lower()
            if confirm == 'y':
                del self.students[sid]
                self.save_data()
                if self.current_user == sid:
                    self.current_user = None
                print(Fore.GREEN + f"✅ Student '{name}' deleted.")
            else:
                print(Fore.YELLOW + "CloseOperation cancelled.")
        else:
            print(Fore.RED + "❌ Student ID not found.")

    def view_profile(self):
        if not self.current_user:
            print(Fore.RED + "❌ You must be logged in to view your profile.")
            return

        data = self.students[self.current_user]
        print(f"\n{Fore.CYAN}{'='*40}")
        print(f"{Fore.CYAN}👤 Your Profile")
        print(f"{Fore.CYAN}{'='*40}")
        print(f"Name: {data['name']}")
        print(f"ID: {self.current_user}")
        print(f"Email: {data['email']}")
        print(f"Registered on: {data['registered_on']}")
        print(f"Total logins: {data['login_count']}")
        print(f"Last login: {data['last_login'] or 'Never'}")

    def logout(self):
        if self.current_user:
            print(Fore.BLUE + f"👋 Goodbye, {self.students[self.current_user]['name']}!")
            self.current_user = None
        else:
            print(Fore.YELLOW + "ℹ️  No user is currently logged in.")

    def run(self):
        print(f"{Fore.GREEN}{Style.BRIGHT}🎓 Welcome to the Enhanced Student Registration & Login System!")
        print(f"{Fore.WHITE}💡 Features: Registration, Secure Login, Search, Profile, Persistence")

        while True:
            # Main menu
            print(f"\n{Fore.WHITE}{'='*50}")
            if self.current_user:
                name = self.students[self.current_user]['name']
                print(f"{Fore.GREEN}✅ Logged in as: {name} ({self.current_user})")
            else:
                print(f"{Fore.YELLOW}🌐 Guest Mode")
            print(f"{Fore.WHITE}{'='*50}")

            print("1. 📝 Register New Student")
            print("2. 🔐 Login")
            print("3. 📋 View All Students")
            print("4. 🔍 Search Student")
            print("5. 🗑️  Delete Student (Admin)")
            if self.current_user:
                print("6. 👤 View My Profile")
                print("7. 🚪 Logout")
            print("0. ❌ Exit")

            choice = input("\nSelect an option: ").strip()

            # Route choices
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
                    print(Fore.GREEN + "\n👋 Thank you for using the Student System! Goodbye.\n")
                    break
                else:
                    print(Fore.RED + "❌ Invalid option. Please try again.")
            except KeyboardInterrupt:
                print(Fore.YELLOW + "\n\n🛑 Program interrupted. Exiting safely...")
                break
            except Exception as e:
                print(Fore.RED + f"💥 Unexpected error: {e}")


# Entry point
if __name__ == "__main__":
    system = StudentSystem()
    system.run()