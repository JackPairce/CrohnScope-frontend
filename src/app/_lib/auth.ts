import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Path to our users JSON file
const usersFilePath =
  process.env.NODE_ENV === "production"
    ? path.join("/tmp", "users.json")
    : path.join(process.cwd(), "secure", "users.json");

type LocalUser = {
  id: string;
  username: string;
  password: string;
  confirmed: boolean;
  createdAt: string;
};

export type User = {
  username: string;
  password: string;
};

export type Response = {
  success: boolean;
  message: string;
  uid?: string;
};
function ensureDirectoryExists() {
  const dirPath =
    process.env.NODE_ENV === "production"
      ? path.join("/tmp")
      : path.join(process.cwd(), "secure");

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // check if the file is not empty
  if (fs.existsSync(usersFilePath)) {
    const fileData = fs.readFileSync(usersFilePath, "utf8");
    if (fileData.trim() !== "") {
      return; // File already exists and is not empty
    }
  }
  // If the file doesn't exist or is empty, create it with an empty array
  fs.writeFileSync(usersFilePath, JSON.stringify([])); // Initialize with an empty array
  console.log("File created successfully");
}

// Read users from JSON file
export function readUsersFromFile(): LocalUser[] {
  ensureDirectoryExists(); // Ensure the file exists
  const fileData = fs.readFileSync(usersFilePath, "utf8");
  return JSON.parse(fileData) as LocalUser[];
}
// Write users to JSON file
export function writeUsersToFile(data: LocalUser[]) {
  ensureDirectoryExists(); // Ensure the directory exists
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
}

export function AddUser(user: LocalUser) {
  const data = readUsersFromFile();
  data.push(user);
  writeUsersToFile(data);
}

export const getUserById = (id: string) => {
  const users = readUsersFromFile();
  return users.find((user) => user.id === id);
};

// Register a new user
export async function registerUser({
  username,
  password,
}: User): Promise<Response> {
  // Check if user already exists
  if (getUserById(username)) {
    return { success: false, message: "Username already exists" };
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser: LocalUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    confirmed: false, // Default to unconfirmed
    createdAt: new Date().toISOString(),
  };

  AddUser(newUser);

  return {
    success: true,
    message: "Registration successful! Waiting for confirmation.",
  };
}

// Login user
export async function loginUser({
  username,
  password,
}: User): Promise<Response> {
  const users = readUsersFromFile();

  // Find user
  const user = users.find((user) => user.username === username);
  if (!user) {
    return { success: false, message: "Invalid username or password" };
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { success: false, message: "Invalid username or password" };
  }

  // Check if confirmed
  if (!user.confirmed) {
    return {
      success: false,
      message: "Account not confirmed yet. Please wait for admin confirmation.",
    };
  }

  return { success: true, uid: user.id, message: "Login successful" };
}
