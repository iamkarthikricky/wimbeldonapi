const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const cors=require("cors");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(cors())
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

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
}; 

app.post("/register", async (request, response) => {
    const { user_name, password} = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const UserExistQuery = `SELECT * FROM user WHERE user_name = '${user_name}'`;
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
                  ('${user_name}', '${hashedPassword}')`;
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
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwtToken });
      } else {
        response.status(400);
        response.send("Invalid password");
      }
    }
  });  

app.post("/round128",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round128 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round128(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})
app.get('/round128',authenticateToken,async(request,response)=>{
  const newQuery=`SELECT * FROM Round128;`
  const qResponse = await database.all(newQuery)
  response.send({matchStats:qResponse})
})