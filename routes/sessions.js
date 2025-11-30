const express=require('express');
const router=express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const checkRole=require('../middleware/checkRole');
const db = require('../db/postgres');
const user = require('../models/user');
const multer = require('multer');

const upload = multer({ dest: 'tmp/uploads/' });

router.get('/create_session', ensureAuthenticated, async (req, res) => {
  try {
    checkRole(req.user.role)
    const username = req.user.username; // assuming user info is in req.user
    let currRole;
    let userResult;
    if(req.user.role==='volunteer'){
        currRole='volunteer'
        userResult = await db.query(
      `SELECT volunteer_id,name, branch_id FROM volunteers WHERE username = $1`,
      [username]
    );
    }
    else if(req.user.role==='branch head'){
        currRole='branch'
        userResult = await db.query(
      `SELECT admin_id,name FROM admins WHERE username = $1`,
      [username]
    );

    }
    else{
        currRole='head'
        userResult = await db.query(
      `SELECT head_id,name FROM heads WHERE username = $1`,
      [username]
    );
    }

    // 1️⃣ Fetch current user info
    
    const currentUser = userResult.rows[0];

    // 2️⃣ Fetch all branches
    const branchesResult = await db.query('SELECT branch_id, branch_name FROM branches');
    const branches = branchesResult.rows;
    console.log(branches);

    // 3️⃣ Fetch all volunteers
    const volunteersResult = await db.query('SELECT volunteer_id, name,branch_id FROM volunteers');
    const volunteers = volunteersResult.rows;

    // 4️⃣ Fetch all subjects
    const subjectsResult = await db.query('SELECT subject_id, name FROM subjects');
    const subjects = subjectsResult.rows;
    
    res.render('forms/register-session.ejs', {
      basePath:currRole,
      currentUser,
      branches,
      volunteers,
      subjects
    });
  } catch (err) {
    console.error('Error rendering page:',err);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/register-session',
  ensureAuthenticated,
  upload.fields([
    { name: 'classImage', maxCount: 1 },
    { name: 'notes', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // form names in your EJS: branch, topic, subject, conductor
      const branchRaw = req.body.branch;
      const topicRaw = req.body.topic;
      const subjectRaw = req.body.subject;
      const conductorRaw = req.body.conductor;
      console.log(branchRaw)
      console.log(subjectRaw)
      console.log(topicRaw)
      console.log(conductorRaw)

      // Basic validation + parse ints
      const branch_id = branchRaw ? parseInt(branchRaw, 10) : null;
      const subject_id = subjectRaw ? parseInt(subjectRaw, 10) : null;
      const conducted_by = conductorRaw ? parseInt(conductorRaw, 10) : null;
      const topic = topicRaw ? String(topicRaw).trim() : '';
      console.log(branch_id)
      console.log(subject_id)
      console.log(conducted_by)
      console.log(topic)
      if (!branch_id || !subject_id || !conducted_by || !topic) {
        return res.status(400).send('Missing required fields');
      }

      const insertQuery = `
        INSERT INTO sessions (branch_id, date, topic, subject_id, conducted_by)
        VALUES ($1, CURRENT_DATE, $2, $3, $4)
        RETURNING session_id
      `;
      const result = await db.query(insertQuery, [
        branch_id,
        topic,
        subject_id,
        conducted_by
      ]);

      // Optionally inspect uploaded files in req.files (we're skipping image handling as requested)
      // console.log(req.files);

      // Redirect to role-based dashboard (uses user's role from req.user)
      const role = req.user.role; // comes from URL
      res.redirect(`/${role}/dashboard`);
    } catch (err) {
      console.error('Error saving session:', err);
      return res.status(500).send('Server error');
    }
  }
);


router.get('/select-session', ensureAuthenticated, async (req, res) => {
  try {
    const query = `
      SELECT 
  s.session_id,
  s.topic,
  v.name AS conductedBy,
  b.branch_name AS branch,
  sub.name AS subject
FROM sessions s
JOIN volunteers v ON s.conducted_by = v.volunteer_id
JOIN branches b ON s.branch_id = b.branch_id
JOIN subjects sub ON s.subject_id = sub.subject_id
WHERE s.status = 'ongoing';

    `;
    const { rows } = await db.query(query);
    res.render('sessions', { sessions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


router.get('/mark-attendance/:sessionId', ensureAuthenticated, async (req, res) => {
  try {
    const { sessionId, role } = req.params;

    // 1️⃣ Fetch session info
    const sessionResult = await db.query(
      `SELECT s.session_id, s.topic, b.branch_id, b.branch_name
       FROM sessions s
       JOIN branches b ON s.branch_id = b.branch_id
       WHERE s.session_id = $1`,
      [sessionId]
    );
    const session = sessionResult.rows[0];
    if (!session) return res.status(404).send("Session not found");

    // 2️⃣ Get students of that branch
    const studentsResult = await db.query(
      `SELECT student_id, name FROM students WHERE branch_id = $1`,
      [session.branch_id]
    );
    const students = studentsResult.rows;

    // Render attendance marking page
    res.render('forms/mark-attendance.ejs', {
      role,
      session,
      students
    });
  } catch (err) {
    console.error("Error fetching attendance page:", err);
    res.status(500).send("Server error");
  }
});


module.exports = router;