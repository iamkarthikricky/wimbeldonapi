const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const bcrypt = require("bcrypt");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.post("/register", async (request, response) => {
    const { username, password} = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const UserExistQuery = `SELECT * FROM user WHERE user_name = '${username}'`;
    const isUserExists = await database.get(UserExistQuery);
  
    if (isUserExists !== undefined) {
      response.status(400);
      response.send("User already exists");
    } else {
      const isPasswordLength = password.length;
      if (isPasswordLength < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const newUserQuery = `INSERT INTO 
                  user (user_name,password) VALUES
                  ('${username}', '${hashedPassword}')`;
        const dbResponse = await database.run(newUserQuery);
        response.status(200);
        response.send("User created successfully");
      }
    }
  });

  app.post("/login", async (request, response) => {
    const { username, password } = request.body;
  
    const UserExistQuery = `SELECT * FROM user WHERE user_name = '${username}';`;
    const isUserExists = await database.get(UserExistQuery);
    if (isUserExists == undefined) {
      response.status(400);
      response.send("Invalid user");
    } else {
      const isPasswordMatched = await bcrypt.compare(
        password,
        isUserExists.password
      );
      if (isPasswordMatched === true) {
        response.status(200);
        response.send("Login success!");
      } else {
        response.status(400);
        response.send("Invalid password");
      }
    }
  });  