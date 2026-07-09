<div align="center">
  <img src="https://raw.githubusercontent.com/Vignesh-V562/BackBenchers/main/public/logo.png" width="80" alt="BackBenchers Logo" />
  <h1>BackBenchers</h1>
  <p><strong>A secure, multi-tenant academic resource sharing platform designed exclusively for college students.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Cloudflare_D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare D1" />
    <img src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="NextAuth.js" />
  </p>
</div>

---

## 📖 About BackBenchers

BackBenchers is a peer-to-peer academic platform that allows students to seamlessly share study notes, previous year question papers (PYQs), and other study materials. 

Built with a **multi-college architecture**, BackBenchers guarantees that students only interact with data, subjects, and materials from their **own college**. The entire platform dynamically molds itself around the authenticated user's institution, keeping environments strictly isolated while running on a single unified backend.

### ✨ Key Features

- 🏫 **College-Gated Authentication:** Users sign up with their college domains, mapping them strictly to their specific institutional walled garden.
- 📂 **Smart Material Repository:** Upload notes, PDFs, and previous question papers enriched with powerful metadata (Subject, Professor, Year, Exam Category).
- 🔍 **Dynamic Discovery:** Advanced filtering and full-text search specifically scoped to the user’s college.
- 👍 **Crowdsourced Curation:** Upvote, downvote, and download tracking to ensure the best notes rise to the top.
- ⚙️ **Auto-Provisioning System:** A flexible global upload module that dynamically registers new departments, subjects, and staff on-the-fly based on user submissions.
- 🔒 **Rock-Solid Data Isolation:** A robust backend query engine that implicitly scopes every single database transaction to the user's `college_id`.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Components:** [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) (Toasts)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQL)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Custom Credentials & JWT)
- **File Storage:** Local/Cloudinary (Abstracted File API)
- **Language:** TypeScript

---

## 🚀 Getting Started

Follow these steps to run BackBenchers locally.

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vignesh-V562/BackBenchers.git
   cd backbenchers-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the necessary environment variables:
   ```env
   NEXTAUTH_SECRET=your_super_secret_string
   NEXTAUTH_URL=http://localhost:3000
   
   # Cloudflare D1 local database is automatically managed by Wrangler/Next.js
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open the Application:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture Highlight: The `collegeId` Sandbox

BackBenchers solves the multi-tenant problem by implementing a custom query wrapper (`queryScoped`). Every read and write to the database is passed through this wrapper, which introspects the SQL query and strictly enforces that a `college_id` filter is present.

This ensures zero risk of cross-college data contamination. A student from College A can never inadvertently query the database and retrieve notes uploaded by a student from College B.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/Vignesh-V562/BackBenchers/issues).

---

## 📄 License

This project is licensed under the MIT License.
