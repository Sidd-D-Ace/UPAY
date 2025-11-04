# UPAY Portal

UPAY Portal is a comprehensive, role-based management system designed for the UPAY organization. It provides a centralized platform for heads, branch heads, and volunteers to manage branches, personnel, students, and academic sessions efficiently.

## Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for three user roles:
    *   **Head:** Top-level administrative access. Can register new branches, branch heads, volunteers, and students. Has a global view of all data.
    *   **Branch Head:** Manages a specific branch. Can register volunteers and students for their branch and create classes.
    *   **Volunteer:** Ground-level user. Can register students and manage their own classes and sessions.
*   **User & Entity Management:** Streamlined forms for registering new heads, branch heads, volunteers, students, and branches.
*   **Dynamic Data Tables:** All lists (students, volunteers, branch heads) are rendered dynamically with features like:
    *   Live search
    *   Status filtering (All, Active, Inactive, Recent)
    *   Infinite scrolling for smooth handling of large datasets.
*   **Session Management:** A dedicated interface for creating and registering new class sessions, including details like conductor, subject, topic, and location.
*   **Hybrid Database Architecture:** Utilizes MongoDB for secure user authentication and PostgreSQL for relational application data, combining the strengths of both.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Frontend:** EJS (Embedded JavaScript), HTML5, CSS3, Vanilla JavaScript
*   **Databases:**
    *   **PostgreSQL:** For managing application data (students, volunteers, branches, etc.).
    *   **MongoDB:** For user accounts and authentication.
*   **Authentication:** Passport.js with `passport-local` and `passport-local-mongoose` for session-based authentication.

## System Architecture

The application is built on a standard Model-View-Controller (MVC) architecture using Express.js.

1.  **Entry Point (`app.js`):** Initializes the Express server, sets up middleware (body-parser, static files), establishes database connections, and configures the EJS view engine.
2.  **Routing (`routes/`):** Routes are modularized based on user roles (`head.js`, `branch.js`, `volunteer.js`) and functionality (`auth.js`, `sessions.js`).
3.  **Authentication & Authorization:**
    *   `passport.js` configures the authentication strategy. User credentials and roles are stored in MongoDB.
    *   `ensureAuthentication.js` middleware protects routes from unauthenticated access.
    *   `checkRole.js` middleware restricts access based on user roles, enforcing the RBAC model.
4.  **Database (`db/`):**
    *   `mongo.js` connects to the MongoDB instance for user authentication.
    *   `postgres.js` connects to the PostgreSQL database for all other application data.
5.  **Controllers (`controllers/`):** The `registerController.js` handles the complex logic of creating new users, which involves registering credentials in MongoDB and inserting profile details into PostgreSQL.
6.  **Views (`views/`):** EJS templates render dynamic HTML. The frontend JavaScript (`public/js/`) interacts with API endpoints (e.g., `/api/students`) to fetch and display data asynchronously, enabling features like live search and infinite scroll without page reloads.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

*   Node.js and npm
*   PostgreSQL
*   MongoDB

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/sidd-d-ace/upay.git
    cd upay
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up Databases:**
    *   Ensure your MongoDB server is running.
    *   Create a PostgreSQL database named `upay`. You will need to define the schema for tables like `heads`, `admins`, `volunteers`, `students`, `branches`, etc., according to the queries in the `routes` and `controllers` files.

4.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    # Secret key for express-session
    SECRET=your_session_secret

    # Password for your PostgreSQL user
    DBPASSWORD=your_postgres_password
    ```

### Running the Application

1.  **Start the server:**
    ```sh
    node app.js
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

## Usage

*   **Sign Up/Login:**
    *   A new `Head` can sign up through the signup page.
    *   Existing users can log in with their email and password.
*   **Dashboard:** Upon successful login, users are redirected to their role-specific dashboard.
*   **Registration:** Use the "Register" panel on the dashboard to add new users or entities. The forms are multi-step for a better user experience.
*   **Management:** Use the "Manage" panel to view lists of students, volunteers, etc. These list pages allow you to filter by status and search by name in real-time.