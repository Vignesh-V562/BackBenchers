-- Backbenchers - Cloudflare D1 SQLite Schema
PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. COLLEGES
-- ============================================================
CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, SUSPENDED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Bound to NextAuth session ID
    college_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    year INTEGER,
    role TEXT DEFAULT 'STUDENT', -- STUDENT, COLLEGE_ADMIN, SUPER_ADMIN
    password_hash TEXT,
    email_verified DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. ACADEMIC STRUCTURE
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(college_id, name),
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    year_or_semester INTEGER NOT NULL,
    UNIQUE(college_id, course_code),
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ============================================================
-- 4. DOCUMENTS (Notes, Question Papers, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    uploader_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    staff_id TEXT,
    type TEXT NOT NULL, -- NOTES, QUESTION_PAPER, OTHER_MATERIAL
    exam_category TEXT, -- CIA1, CIA2, MIDSEM, ENDSEM
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    department_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    upvotes_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. VOTES & DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_id TEXT,
    answer_id TEXT,
    value INTEGER NOT NULL, -- 1 (upvote) or -1 (downvote)
    UNIQUE(user_id, document_id),
    UNIQUE(user_id, answer_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. Q&A MODULE
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    subject_id TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    body TEXT NOT NULL,
    upvotes_count INTEGER DEFAULT 0,
    is_accepted INTEGER DEFAULT 0, -- 0 (false) or 1 (true)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. MODERATION & REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    document_id TEXT,
    answer_id TEXT,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, RESOLVED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. COMPOSITE INDEXES (Multi-College Partitioning & Queries)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_docs_college_subj ON documents(college_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_docs_college_dept ON documents(college_id, department_id);
CREATE INDEX IF NOT EXISTS idx_docs_college_cat  ON documents(college_id, type, exam_category);
CREATE INDEX IF NOT EXISTS idx_users_college     ON users(college_id);
CREATE INDEX IF NOT EXISTS idx_questions_college ON questions(college_id);
