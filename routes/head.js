const express=require('express');
const router=express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const { registerUser , registerBranch, registerStudent,registerHead} = require('../controllers/registerController');
const checkRole=require('../middleware/checkRole');
const db = require('../db/postgres');

// router.route.get('/',(req,res)=>{
//     res.render('login');
// })



router.post("/adduser", registerHead);
router.post('/register-user', ensureAuthenticated, checkRole('head'), registerUser);
router.post('/register-branch-head',ensureAuthenticated,checkRole('head'), registerUser);
router.post('/register-branch',ensureAuthenticated, checkRole('head'), registerBranch);
router.post('/register-student',ensureAuthenticated,checkRole('head'),registerStudent);

router.get('/signup',(req,res)=>{
  res.render('signup.ejs');
});

router.get('/dashboard',ensureAuthenticated, checkRole('head') ,async (req, res) => {
  try {
    const result = await db.query("SELECT name FROM Heads WHERE username=$1", [req.user.username]);
    const headName = result.rows.length > 0 ? result.rows[0].name : req.user.username;

    res.render('dashboard/head-dashboard', { name: headName });
  } catch (err) {
    console.error("Error fetching head name:", err);
    res.render('dashboard/head-dashboard', { name: "Unknown" });
  }
});





router.get('/volunteer_form', ensureAuthenticated, checkRole('head'), async(req, res) => {
  try {

    // Fetch all branches
    const branchesResult = await db.query("SELECT branch_id, branch_name FROM branches");
    const branches = branchesResult.rows;

    res.render('forms/volunteer_form', { branches, basePath: '/head' });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

router.get('/student_form',ensureAuthenticated,checkRole("head"),async (req,res)=>{
    try {

    // Fetch all branches
    const branchesResult = await db.query("SELECT branch_id, branch_name FROM branches");
    const branches = branchesResult.rows;

    res.render('forms/student_form', { branches, basePath: '/head' });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
})

router.get('/branch_head_form',ensureAuthenticated,checkRole("head"),(req,res)=>{
    res.render('forms/branch_head_form',{ basePath: '/head'});
})



router.get('/Student_form', ensureAuthenticated, checkRole('head'), (req, res) => {
  res.render('/forms/student-form.ejs', { basePath: '/head' });
});

router.get('/branch_form',ensureAuthenticated, checkRole('head'),async (req,res)=>{
    try{
        const branchHeadsResult = await db.query("SELECT admin_id, name FROM admins");
        const branchHeads = branchHeadsResult.rows;
        console.log(branchHeads);
    // Fetch all heads (if different from branch heads)
    const headsResult = await db.query("SELECT head_id, name FROM heads");
    const heads = headsResult.rows;
        console.log(heads);
    // Render EJS page and pass the     data
    res.render('forms/branch_form', { branchHeads, heads, basePath: '/head' });
  } catch (err) {
    console.error("Error fetching heads:", err);
    res.status(500).send("Error fetching data");
    }
});


// --- Student list (page + API with filters) ---

// Render page (EJS shell only)
router.get("/student_list", ensureAuthenticated, checkRole("head"), async (req, res) => {
  try {
    res.render("lists/students_list", { query: req.query ,basePath: '/head' });
  } catch (err) {
    console.error("Error rendering student_list:", err);
    res.status(500).send("Error rendering student list");
  }
});

// Fetch students with status filter
router.get("/api/students", async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        s.student_id, 
        s.name, 
        s.age, 
        s.gender, 
        s.status, 
        b.branch_name AS branch,
        COALESCE(a.attendance, '0%') AS attendance,
        s.enrollment_date
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN (
        SELECT 
          student_id,
          CONCAT(
            ROUND(
              (COUNT(*) FILTER (WHERE status = 'Present')::numeric / NULLIF(COUNT(*),0)) * 100,
              0
            ), '%'
          ) AS attendance
        FROM student_attendance
        GROUP BY student_id
      ) a ON s.student_id = a.student_id
    `;

    const values = [];
    const conditions = [];

    // Status filter
    if (status === "Active" || status === "Inactive") {
      conditions.push(`s.status = $${values.length + 1}`);
      values.push(status);
    }

    // Search filter
    if (search) {
      conditions.push(`s.name ILIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Sorting
    if (status === "Recent") {
      query += ` ORDER BY s.enrollment_date DESC`;
    } else {
      query += ` ORDER BY s.student_id`;
    }

    const result = await db.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.get("/volunteer_list", ensureAuthenticated, checkRole("head"), async (req, res) => {
  try {
    res.render("lists/volunteer_list", { query: req.query ,basePath: '/head' });
  } catch (err) {
    console.error("Error rendering volunteer_list:", err);
    res.status(500).send("Error rendering volnteer list");
  }
});

router.get("/api/volunteers", async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        v.volunteer_id, 
        v.name, 
        v.age, 
        v.gender, 
        v.status, 
        b.branch_name AS branch,
        COALESCE(a.attendance, '0%') AS attendance,
        v.join_date
      FROM volunteers v
      LEFT JOIN branches b ON v.branch_id = b.branch_id
      LEFT JOIN (
        SELECT 
          volunteer_id,
          CONCAT(
            ROUND(
              (COUNT(*) FILTER (WHERE status = 'Present')::numeric / NULLIF(COUNT(*),0)) * 100,
              0
            ), '%'
          ) AS attendance
        FROM volunteer_attendance
        GROUP BY volunteer_id
      ) a ON v.volunteer_id = a.volunteer_id
    `;

    if (status === "Active" || status === "Inactive") {
      query += ` WHERE v.status = $1 ORDER BY v.volunteer_id`;
      const result = await db.query(query, [status]);
      return res.json(result.rows);
    }

    if (status === "Recent") {
      query += ` ORDER BY v.join_date DESC`;
      const result = await db.query(query);
      return res.json(result.rows);
    }

    // All volunteers
    query += ` ORDER BY v.volunteer_id`;
    const result = await db.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/branch_head_list", ensureAuthenticated, checkRole("head"), async (req, res) => {
  try {
    res.render("lists/branch_head_list", { query: req.query });
  } catch (err) {
    console.error("Error rendering branch_head_list:", err);
    res.status(500).send("Error rendering branch head list");
  }
});

router.get("/api/branch_heads", async (req, res) => {
  try {
    const { status, search } = req.query;

    // Join admins with branches to get branch name
    let query = `
      SELECT 
        a.admin_id, 
        a.name, 
        a.age, 
        a.gender, 
        a.status,
        a.join_date,
        b.branch_name
      FROM admins a
      LEFT JOIN branches b ON b.admin_id = a.admin_id
    `;

    const values = [];
    const conditions = [];

    // Status filter
    if (status === "Active" || status === "Inactive") {
      conditions.push(`a.status = $${values.length + 1}`);
      values.push(status);
    }

    // Search filter
    if (search) {
      conditions.push(`a.name ILIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Order by join_date for recent, else by admin_id
    if (status === "Recent") {
      query += ` ORDER BY a.join_date DESC`;
    } else {
      query += ` ORDER BY a.admin_id`;
    }

    const result = await db.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching branch heads:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;