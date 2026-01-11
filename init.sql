-- 1. Create Heads Table (Independent)
CREATE TABLE IF NOT EXISTS heads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    join_date VARCHAR(50), -- Storing as string to match your .toLocaleString() input
    status VARCHAR(20) DEFAULT 'Active',
    gender VARCHAR(20),
    aadharno VARCHAR(20),
    education VARCHAR(255),
    age INTEGER
);

-- 2. Create Admins Table (Branch Heads) (Independent)
-- Corresponds to role='branch head' in your code
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL, -- Likely the email
    join_date VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    gender VARCHAR(20),
    aadharno VARCHAR(20),
    education VARCHAR(255),
    age INTEGER
);

-- 3. Create Branches Table
-- Depends on Heads and Admins existing first
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    head_id INTEGER REFERENCES heads(id) ON DELETE SET NULL,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL
);

-- 4. Create Volunteers Table
-- Depends on Branches existing first
CREATE TABLE IF NOT EXISTS volunteers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    join_date VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    gender VARCHAR(20),
    aadharno VARCHAR(20),
    education VARCHAR(255),
    age INTEGER,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL
);

-- 5. Create Students Table
-- Depends on Branches existing first
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    enrollment_date VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    gender VARCHAR(20),
    aadharno VARCHAR(20),
    education VARCHAR(255),
    age INTEGER,
    school VARCHAR(255),
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL
);