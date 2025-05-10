import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Path to our users JSON file
const usersFilePath = path.join(process.cwd(), "secure", "users.json");

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

// Read users from JSON file
export function readUsersFromFile(): LocalUser[] {
  const fileData = fs.readFileSync(usersFilePath, "utf8");
  const data: LocalUser[] = JSON.parse(fileData);
  return data;
}

// Write users to JSON file
export function writeUsersToFile(data: LocalUser[]) {
  const dirPath = path.join(process.cwd(), "secure");

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
}

export function AddUser(user: LocalUser) {
  const data = readUsersFromFile();
  data.push(user);
  writeUsersToFile(data);
}

export const getUserByUsername = (username: string) => {
  const users = readUsersFromFile();
  return users.find((user) => user.username === username);
};

// Register a new user
export async function registerUser({
  username,
  password,
}: User): Promise<Response> {
  // Check if user already exists
  if (getUserByUsername(username)) {
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
