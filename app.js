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

const newResponse=(matchInfo,totalDF)=>{
  return{
    totalDF:totalDF["totalDF"],
    matchStats : matchInfo,
  }
}
app.get('/round128',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round128;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round128;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})

app.post("/round64",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round64 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round64(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})

app.get('/round64',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round64;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round64;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})

app.post("/round32",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round32 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round32(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})

app.get('/round32',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round32;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round32;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})

app.post("/round16",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round16 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round16(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})

app.get('/round16',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round16;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round16;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})

app.post("/round8",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round8 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round8(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})

app.get('/round8',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round8;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round8;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})

app.post("/round4",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round4 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round4(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})

app.get('/round4',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round4;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round4;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})


app.post("/round2",async(request,response)=>{
  const{player1,player2,doubleFaults}=request.body
  const playerExistsQuery=`SELECT * FROM Round2 WHERE player1 = '${player1}' OR player2='${player2}';`
  const isPlayerExists = await database.get(playerExistsQuery)
  if(isPlayerExists !== undefined){
    response.status(400)
  }
  else{
    const addMatchStats=`INSERT INTO Round2(player1,player2,doublefaults) VALUES('${player1}','${player2}',${doubleFaults});`
    const dbResponse = await database.run(addMatchStats)
    response.status(200)
  }
})
app.get('/round2',authenticateToken,async(request,response)=>{
  const matchesQuery=`SELECT * FROM Round2;`
  const totalDFQuery=`SELECT SUM(doublefaults) as totalDF FROM Round2;`
  const dFQueryResponse = await database.get(totalDFQuery)
  const matchesQueryResponse = await database.all(matchesQuery)
  response.send(newResponse(matchesQueryResponse,dFQueryResponse))
})