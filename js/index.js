// First step: Get Firebase configuration
// This object contains the unique keys and identifiers that allow your app to connect to your Firebase project.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "crud-e3adc.firebaseapp.com",
  databaseURL: "https://crud-e3adc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crud-e3adc",
  storageBucket: "crud-e3adc.firebasestorage.app",
  messagingSenderId: """,
  appId: ""
};

// Second step: Initialize Firebase
// This initializes the Firebase app instance using the provided configuration.
firebase.initializeApp(firebaseConfig);

// Third step: Initialize Firestore
// This creates a Firestore instance, allowing us to perform database operations.
const db = firebase.firestore();

// Fourth step: Define a collection reference
// This creates a reference to a specific collection named "users" in Firestore.
// All CRUD operations will target this collection.
const usersCollection = db.collection('users');

// Fifth step: Define a state variable
// This variable keeps track of whether the app is in "edit mode" or "create mode."
// Initially, it's null, meaning no user is being edited.
let editingUserId = null;

// Sixth step: Function to create or update a user
// This function handles both adding new users and updating existing users based on the state of `editingUserId`.
async function saveUser() {
    // 6.1: Get form inputs
    // Retrieve the values entered by the user in the "Name" and "Email" fields.
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    
    // 6.2: Prepare the data object
    // This object contains the data that will be saved to Firestore.
    const userData = {
        name: nameInput.value, // Name entered by the user
        email: emailInput.value, // Email entered by the user
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Current server time
    };
    
    // 6.3: Try-catch block for error handling
    try {
        if (editingUserId) {
            // 6.4: Edit mode
            // If `editingUserId` has a value, update the corresponding document in Firestore.
            await usersCollection.doc(editingUserId).update(userData);

            // Reset `editingUserId` to null after the update, returning to create mode.
            editingUserId = null;

            // Change the button text back to "Save User" after editing.
            document.getElementById('saveBtn').textContent = 'Save User';
        } else {
            // 6.5: Create mode
            // If `editingUserId` is null, add a new document to the "users" collection.
            
            await usersCollection.add(userData);
        }
        
        // 6.6: Clear form inputs after saving.
        nameInput.value = '';
        emailInput.value = '';

        // Reload the user list to reflect the new data.
        loadUsers();
    } catch (error) {
        // Handle any errors that occur during the operation.
        console.error("Error saving user: ", error);
        alert('Error saving user');
    }
}

// Seventh step: Function to load and display users
// Fetches all documents from the "users" collection and displays them in the HTML table.
async function loadUsers() {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = ''; // Clear the table before populating new data

    try {
        // Fetch all users, ordered by the "timestamp" field in descending order.
        const snapshot = await usersCollection.orderBy('timestamp', 'desc').get();

        // Iterate over each document in the snapshot and create table rows.
        snapshot.forEach(doc => {
            const user = doc.data(); // Extract data from the document
            const row = document.createElement('tr'); // Create a table row

            // Populate the row with user data and action buttons.
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <!-- Edit button to switch to edit mode -->
                    <button class="edit-btn" onclick="editUser('${doc.id}', '${user.name}', '${user.email}')">Edit</button>
                    <!-- Delete button to remove a user -->
                    <button class="delete-btn" onclick="deleteUser('${doc.id}')">Delete</button>
                </td>
            `;

            // Append the row to the table body.
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading users: ", error);
        alert('Error loading users');
    }
}

// Eighth step: Edit a user
// This function is called when the "Edit" button is clicked for a user.
function editUser(userId, name, email) {
    // Set the `editingUserId` to the ID of the selected user document.
    editingUserId = userId;

    // Pre-fill the form inputs with the selected user's data.
    document.getElementById('nameInput').value = name;
    document.getElementById('emailInput').value = email;

    // Change the button text to indicate that the app is in edit mode.
    document.getElementById('saveBtn').textContent = 'Update User';
}

// Ninth step: Delete a user
// Deletes a user document from Firestore when the "Delete" button is clicked.
async function deleteUser(userId) {
    // Ask the user for confirmation before deleting.
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            // Use the `doc()` method to reference the user document and delete it.
            await usersCollection.doc(userId).delete();

            // Reload the user list to reflect the deletion.
            loadUsers();
        } catch (error) {
            console.error("Error deleting user: ", error);
            alert('Error deleting user');
        }
    }
}

// Tenth step: Initial load
// Load users when the app starts.
loadUsers();
