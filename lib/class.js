import * as SQLite from 'expo-sqlite';

// Declare a global variable for the database
let db;

// Initialize the database asynchronously and create necessary tables
const setupDatabase = async () => {
  // Open or create the database asynchronously
  db = await SQLite.openDatabaseAsync('Aora.db');
  console.log("Database initialized");
};

// --- Table Creation Functions ---

// Create a dynamic attendance table based on subject, branch, and section
export const createDynamicAttendanceTable = async (subject, branch, section) => {
  subject = subject.toLowerCase().split(" ").join("_"); // Replace spaces with underscores in subject
  const tableName = `${subject}_${branch.toLowerCase()}${section.toLowerCase()}`; // Construct table name

  // SQL query to create the table for storing roll numbers and attendance
  const createDynamicTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (roll_number TEXT PRIMARY KEY NOT NULL);`;

  try {
    // Execute the query to create the table
    await db.execAsync(createDynamicTableQuery);
    console.log(`Table ${tableName} created or already exists`);
  } catch (error) {
    console.log(error); // Log any errors that occur during table creation
  }
};

// Create the faculty details table
export const createFacultyTable = async () => {
  const createFacultyTableQuery = `
    CREATE TABLE IF NOT EXISTS faculty_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      branch_section TEXT NOT NULL,
      day TEXT NOT NULL,
      UNIQUE (subject, branch_section, day) -- Ensure that each subject, section, and day combo is unique
    );
  `;
  try {
    await db.execAsync(createFacultyTableQuery); // Execute the query to create the table
    console.log("Faculty details table created");
  } catch (error) {
    console.log("Error creating faculty details table:", error); // Log any errors that occur during table creation
  }
};

// --- Data Insertion and Management Functions ---

// Insert roll numbers into the dynamically created table
export const insertIntoDynamicAttendanceTable = async (subject, branch, section, rollNumbers) => {
  subject = subject.toLowerCase().split(" ").join("_"); // Convert subject to valid table name format
  const tableName = `${subject}_${branch.toLowerCase()}${section.toLowerCase()}`; // Construct table name

  // SQL query to insert roll number into the table
  const insertRollNumberQuery = `INSERT INTO ${tableName} (roll_number) VALUES ($rollNumber);`;
  const inserted = []; // Array to track inserted roll numbers

  try {
    // Iterate over the provided roll numbers
    for (const rollNumber of rollNumbers) {
      const statement = await db.prepareAsync(insertRollNumberQuery); // Prepare the SQL statement
      await statement.executeAsync({ $rollNumber: rollNumber }); // Execute the insertion
      inserted.push(rollNumber); // Track the inserted roll number
      console.log(`Roll number ${rollNumber} inserted into ${tableName}`);
    }

    // Check if all roll numbers were inserted
    if (inserted.length == rollNumbers.length) {
      console.log(`${inserted.length} values inserted successfully`);
    } else {
      throw new Error("Failed to insert values"); // Throw error if insertion fails
    }
  } catch (error) {
    console.log(error); // Log any errors that occur during insertion
  }
};

// Insert a new faculty member's details
export const insertFacultyDetails = async (subject, branch_section, day) => {
  // Validate inputs
  if (!subject || !branch_section || !day) {
    console.error("Missing required fields: subject, branch_section, or day");
    return; // Return early if any of the required fields are missing
  }

  const insertFacultyQuery = `
    INSERT INTO faculty_details (subject, branch_section, day) 
    VALUES ($subject, $branch_section, $day);
  `;

  try {
    // Prepare the SQL statement
    const statement = await db.prepareAsync(insertFacultyQuery);

    // Execute the statement with the given values
    await statement.executeAsync({
      $subject: subject,
      $branch_section: branch_section,
      $day: day
    });

    // Finalize the statement after execution
    await statement.finalizeAsync();

    console.log("Faculty details added successfully");
  } catch (error) {
    console.log("Failed to insert faculty details:", error); // Log any errors that occur during insertion
  }
};

// --- Data Retrieval Functions ---

// Retrieve all roll numbers from a dynamic table
export const getAllRollNumbers = async (subject, branch, section) => {
  subject = subject.toLowerCase().split(" ").join("_"); // Convert subject to valid table name format
  const tableName = `${subject}_${branch.toLowerCase()}${section.toLowerCase()}`; // Construct table name
  const getAllRollNumbersQuery = `SELECT * FROM ${tableName};`; // SQL query to fetch all roll numbers

  try {
    // Execute the query to retrieve roll numbers
    const result = await db.getAllAsync(getAllRollNumbersQuery);
    return result; // Return the retrieved data
  } catch (error) {
    console.log("Failed to retrieve roll numbers:", error); // Log errors if they occur
    return []; // Return an empty array in case of failure
  }
};

// Retrieve all attendance data for a specific subject and section
export const getAttendanceData = async (subject, section) => {
  subject = subject.toLowerCase().split(" ").join("_"); // Convert subject to valid table name format
  const tableName = `${subject}_${section.toLowerCase()}`; // Construct table name
  const getAttendanceDataQuery = `SELECT * FROM ${tableName};`; // SQL query to fetch attendance data

  try {
    const result = await db.getAllAsync(getAttendanceDataQuery); // Execute the query
    return result; // Return the retrieved data
  } catch (error) {
    console.log("Failed to retrieve attendance data:", error); // Log errors if they occur
    return []; // Return an empty array in case of failure
  }
};

// Retrieve all faculty details from the database
export const getAllFaculties = async () => {
  const statement = 'SELECT * FROM faculty_details'; // SQL query to fetch all faculty details

  try {
    const result = await db.getAllAsync(statement); // Execute the query
    return result; // Return the retrieved faculty data
  } catch (error) {
    console.log("Failed to retrieve faculty data:", error); // Log errors if they occur
    return []; // Return an empty array in case of failure
  }
};

// --- Attendance Marking Functions ---

// Add a new column for attendance on a specific date
export const addDateColumnToDynamicAttendanceTable = async (tableName, date) => {
  // SQL query to add a new column for the date
  const addDateColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN date_${date} INTEGER DEFAULT 0;`;

  try {
    // Execute the query to add the new column
    const result = await db.execAsync(addDateColumnQuery);
    console.log(`New column date_${date} added to ${tableName}`);
    return result; // Return the result if needed
  } catch (error) {
    console.log("Failed to add date column:", error); // Log any errors that occur during column addition
  }
};

// Mark attendance for specific roll numbers on a specific date
export const markAttendance = async (subject, branch, section, presnties, date, attendanceStatus) => {
  subject = subject.toLowerCase().split(" ").join("_"); // Convert subject to valid table name format
  const tableName = `${subject}_${branch.toLowerCase()}${section.toLowerCase()}`; // Construct table name

  // Convert the provided date to IST (Indian Standard Time)
  const IST = new Date(date);
  IST.setHours(IST.getHours() + 5); // Adjust for IST
  IST.setMinutes(IST.getMinutes() + 30); // Further adjust for IST
  console.log("Original Date:", date, "Converted to IST:", IST);

  // Format the date to YYYYMMDD for use in the query
  const formattedDate = IST.toISOString().split('T')[0].replace(/-/g, ''); // Convert to YYYYMMDD format

  // Add the column for the specific date in the attendance table
  await addDateColumnToDynamicAttendanceTable(tableName, formattedDate);

  // Determine the attendance value (1 for present, 0 for absent)
  const attendanceValue = attendanceStatus === 'Present' ? 1 : 0;

  // Iterate over each roll number in the presnties array
  for (const rollNumber of presnties) {
    const markAttendanceQuery = `UPDATE ${tableName} SET date_${formattedDate} = ${attendanceValue} WHERE roll_number = $rollNumber;`;

    try {
      const statement = await db.prepareAsync(markAttendanceQuery); // Prepare the SQL statement
      try {
        await statement.executeAsync({ $rollNumber: rollNumber }); // Execute the update query
        console.log(`Attendance marked for roll number ${rollNumber} as ${attendanceStatus} on date ${formattedDate} in ${tableName}`);
      } finally {
        await statement.finalizeAsync(); // Finalize the statement after execution
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error); // Log errors if attendance marking fails
    }
  }
};

// Initialize the database setup
setupDatabase();
