import SQLite from 'react-native-sqlite-storage';
import bcrypt from 'bcryptjs';

// Open the existing database file
const db = SQLite.openDatabase(
  { name: 'attendanceApp.db', location: 'default' },
  () => {
    console.log('Database opened successfully');
  },
  error => {
    console.error('Error opening database:', error);
  }
);

// Function to handle user signup
export const signupUser = (username, email, password) => {
  return new Promise((resolve, reject) => {
    if (!username || !email || !password) {
      reject('Please fill in all fields');
      return;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt rounds

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        (tx, results) => {
          resolve('User registered successfully');
        },
        (tx, error) => {
          reject('Could not register user: ' + error.message);
        }
      );
    });
  });
};

// Function to handle user login
export const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject('Please fill in all fields');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (tx, results) => {
          // Check if results have any rows
          if (results.rows.length > 0) {
            const user = results.rows.item(0); // Get the user data
            if (!user || !user.password) {
              reject('User not found or invalid user data');
              return;
            }
            // Compare hashed password with input password
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (isPasswordValid) {
              resolve(user); // Return user object for further use
            } else {
              reject('Invalid email or password');
            }
          } else {
            reject('Invalid email or password');
          }
        },
        (tx, error) => {
          reject('Could not execute query: ' + error.message);
        }
      );
    });
  });
};
