# -------------------------------------
# STUDENT REGISTRATION & LOGIN SYSTEM
# -------------------------------------

# Create an empty list to store all registered student records
students = []


# Define a function to add a new student
def add_student():

    # Display a heading for adding a student
    print("\n--- Add New Student ---")

    # Ask for student name, remove extra spaces, and format it properly
    name = input("Enter student name: ").strip().title()

    # Ask for student ID and remove extra spaces
    student_id = input("Enter student ID: ").strip()

    # Ask for student email, remove spaces, and convert to lowercase
    email = input("Enter student email: ").strip().lower()

    # Check if any of the inputs are empty
    if name == "" or student_id == "" or email == "":
        # Display an error message if any field is empty
        print("All fields are required.")
        # Exit the function early
        return

    # Create a formatted string containing all student details
    student = f"Name: {name} | ID: {student_id} | Email: {email}"

    # Add the student record to the list
    students.append(student)

    # Confirm that the student was added successfully
    print("Student added successfully!")


# Define a function to display all registered students
def view_all_students():

    # Display a heading for viewing students
    print("\n--- All Students ---")

    # Check if the student list is empty
    if len(students) == 0:
        # Inform the user that no students are registered
        print("No students registered yet.")
    else:
        # Loop through all students using their index
        for i in range(len(students)):
            # Print each student with a numbered list
            print(str(i + 1) + ". " + students[i])


# Define a function to search for a student
def search_student():

    # Display a heading for searching students
    print("\n--- Search Student ---")

    # Ask for search input, remove spaces, and convert to lowercase
    search_term = input("Enter student name or ID to search: ").strip().lower()

    # Create a flag to track if a student is found
    found = False

    # Loop through each student record
    for student in students:
        # Perform a case-insensitive search within the student record
        if search_term in student.lower():
            # Display the matching student record
            print("Found:", student)
            # Update the flag to show a match was found
            found = True

    # Check if no student matched the search
    if found == False:
        # Display a message if no student was found
        print("No student found with that name or ID.")


# Define a function to delete a student
def delete_student():

    # Display a heading for deleting students
    print("\n--- Delete Student ---")

    # Ask for search input, remove spaces, and convert to lowercase
    search_term = input("Enter student name or ID to delete: ").strip().lower()

    # Create a flag to track if a student is found
    found = False

    # Loop through the list using indexes
    for i in range(len(students)):
        # Check if the search term matches a student record
        if search_term in students[i].lower():
            # Display which student is being deleted
            print("Deleting:", students[i])
            # Remove the student from the list
            students.pop(i)
            # Update the flag to show deletion occurred
            found = True
            # Stop the loop after deleting one student
            break

    # Check if no student was deleted
    if found == False:
        # Display a message if no matching student was found
        print("No student found to delete.")


# Define the main menu function
def main_menu():

    # Run the menu continuously until the user chooses to exit
    while True:

        # Display the main menu options
        print("\n=== Student Registration System ===")
        print("1. Add Student")
        print("2. View All Students")
        print("3. Search Student")
        print("4. Delete Student")
        print("5. Exit")

        # Ask the user for their menu choice and clean input
        choice = input("Enter your choice (1-5): ").strip()

        # Check if the user selected option 1
        if choice == "1":
            # Call the function to add a student
            add_student()

        # Check if the user selected option 2
        elif choice == "2":
            # Call the function to view all students
            view_all_students() 

        # Check if the user selected option 3
        elif choice == "3":
            # Call the function to search for a student
            search_student()

        # Check if the user selected option 4
        elif choice == "4":
            # Call the function to delete a student
            delete_student()

        # Check if the user selected option 5
        elif choice == "5":
            # Display exit message
            print("Thank you for using Student Registration System!")
            # Exit the loop and end the program
            break

        # Handle invalid menu choices
        else:
            # Display an error message for invalid input
            print("Invalid choice. Please try again.")


# Start the program by calling the main menu
main_menu()













