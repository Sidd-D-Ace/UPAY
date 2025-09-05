const User = require('../models/user');
const db = require('../db/postgres'); // adjust if your postgres export is different


// Add new Head (register + login + Postgres insert)
async function registerHead(req, res) {
  console.log(req.body);

  if (req.body.role === 'head') {
    const { role, name, age, gender, aadhar, education, email, password } = req.body;
    const indianTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ✅ Validate required fields
    if (!email || !password || !role || !name || !gender || !aadhar || !education || !age) {
      console.log("Missing field!");
      return res.status(400).send("Bad Request - Missing field(s).");
    }

    // ✅ Create auth user for login (Passport local-mongoose)
    const newUser = new User({
      username: email, // passport-local-mongoose uses "username"
      email,
      role
    });

    User.register(newUser, password, async (err, user) => {
      if (err) {
        if (err.name === 'UserExistsError') {
          console.log("User already exists!");
          return res.status(400).send("User already exists, please login instead.");
        }
        console.error("Registration error:", err);
        return res.status(500).send("Something went wrong during signup.");
      }

      // ✅ Insert into Postgres (heads table)
      try {
        await db.query(
          `INSERT INTO heads (name, username, email, join_date, status, gender, aadharno, education, age)
           VALUES ($1, $2, $3, $4, 'Active', $5, $6, $7, $8)`,
          [name, email, email, indianTime, gender, aadhar, education, age]
        );

        console.log("Head registered successfully!");
        return res.redirect('/head/dashboard'); // redirect to Head dashboard
      } catch (pgErr) {
        console.error("Postgres insert error:", pgErr);
        return res.status(500).send("Error saving Head to Postgres.");
      }
    });
  } else {
    return res.status(400).send("Invalid role.");
  }
}



async function registerUser(req, res) {
  console.log(req.body);

  if (req.body.role === 'volunteer') {
    const { role, name, age, gender, address, branch, education, aadhar, school, email, password } = req.body;
    const indianTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ✅ Validate input
    if (!email || !password || !role || !name || !gender || !aadhar || !education || !age || !address || !branch || !school) {
      console.log("Missing field!");
      return res.status(400).send("Bad Request - Missing field(s).");
    }

    // ✅ Create new user object
    const newUser = new User({
      username: email,  // passport-local-mongoose requires username
      email,
      role
    });

    // ✅ Register user
    User.register(newUser, password, async (err, user) => {
      if (err) {
        if (err.name === 'UserExistsError') {
          console.log("User already exists!");
          return res.status(400).send("User already exists, please login instead.");
        }
        console.error("Registration error:", err);
        return res.status(500).send("Something went wrong during signup.");
      }

      // ✅ Insert into volunteers table
      try {
        await db.query(
          "INSERT INTO volunteers(name,username,join_date,status,gender,aadharno,education,age,branch_id) VALUES($1,$2,$3,'Active',$4,$5,$6,$7,$8)",
          [name, email, indianTime, gender, aadhar, education, age, branch]
        );
        console.log("Volunteer registered successfully!");
        return res.redirect('/head/dashboard'); // or branch dashboard if branch registers
      } catch (pgErr) {
        console.error("Postgres insert error:", pgErr);
        return res.status(500).send("Error saving volunteer to Postgres.");
      }
    });
  }
  else if(req.body.role==='branch head'){
    const { role, name, age, gender, address, education, aadhar, school, email, password } = req.body;
    const indianTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ✅ Validate input
    if (!email || !password || !role || !name || !gender || !aadhar || !education || !age || !address || !school) {
      console.log("Missing field!");
      return res.status(400).send("Bad Request - Missing field(s).");
    }

    // ✅ Create new user object
    const newUser = new User({
      username: email,  // passport-local-mongoose requires username
      email,
      role
    });

    // ✅ Register user
    User.register(newUser, password, async (err, user) => {
      if (err) {
        if (err.name === 'UserExistsError') {
          console.log("User already exists!");
          return res.status(400).send("User already exists, please login instead.");
        }
        console.error("Registration error:", err);
        return res.status(500).send("Something went wrong during signup.");
      }

      // ✅ Insert into volunteers table
      try {
        await db.query(
          "INSERT INTO admins(name,username,join_date,status,gender,aadharno,education,age) VALUES($1,$2,$3,'Active',$4,$5,$6,$7)",
          [name, email, indianTime, gender, aadhar, education, age]
        );
        console.log("Branch Head registered successfully!");
        if(req.user.role==='head') return res.redirect('/head/dashboard'); // or branch dashboard if branch registers
        else if (req.user.role==='branch') return res.redirect('/branch/dashboard');
      } catch (pgErr) {
        console.error("Postgres insert error:", pgErr);
        return res.status(500).send("Error saving volunteer to Postgres.");
      }
    });
  }
   else {
    return res.status(400).send("Invalid role");
  }
}

async function registerBranch(req,res){
  console.log(req.body);
  const {name,address,branchHead,head}=req.body;
  if (!name || !address || !branchHead || !head) {
      console.log("Missing field!");
      return res.status(400).send("Bad Request - Missing field(s).");
    }

    try{
      const result=await db.query('INSERT INTO branches(branch_name,location,head_id,admin_id) VALUES($1,$2,$3,$4)',
        [name,address,head,branchHead]
      )
      console.log("Succesfully created new branch..");
      return res.redirect('/head/dashboard'); // or branch dashboard if branch registers
      } catch (pgErr) {
        console.error("Postgres insert error:", pgErr);
        return res.status(500).send("Error saving volunteer to Postgres.");
    }
}

async function registerStudent(req,res) {
  console.log(req.body);
  const {role,name,age,gender,branch,address,education,aadhar,school}=req.body;
  const indianTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ✅ Validate input
    if ( !role || !name || !gender || !aadhar || !education || !age || !address || !branch || !school) {
      console.log("Missing field!");
      return res.status(400).send("Bad Request - Missing field(s).");
    }
    try {
        await db.query(
          "INSERT INTO students(name,enrollment_date,status,gender,aadharno,education,age,school,branch_id) VALUES($1,$2,'Active',$3,$4,$5,$6,$7,$8)",
          [name,indianTime, gender, aadhar, education, age,school,branch]
        );
        console.log("Student registered successfully!");
        if(req.user.role==='head') return res.redirect('/head/dashboard'); // or branch dashboard if branch registers
        else if(req.user.role==='volunteer') return res.redirect('/volunteer/dashboard');
        else if (req.user.role==='branch head') return res.redirect('/branch/dashboard');
      } catch (pgErr) {
        console.error("Postgres insert error:", pgErr);
        return res.status(500).send("Error saving volunteer to Postgres.");
      }

}

module.exports = { registerUser , registerBranch, registerStudent,registerHead};
