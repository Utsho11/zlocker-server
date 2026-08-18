# 🛡️ zLocker Server — Backend API & Cloud Purge Engine

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express%204.x-black)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloud%20Storage-Cloudinary%20(zlocker%2F)-blue)](https://cloudinary.com/)
[![Vercel Serverless](https://img.shields.io/badge/Deploy-Vercel%20Serverless-black?logo=vercel)](https://vercel.com/)

**zLocker Server** is the RESTful API and cloud storage orchestrator powering [zLocker](https://github.com/Utsho11/zLocker-client). It manages zero-knowledge ciphertext notes, multi-format media storage in Cloudinary (`zlocker/` folder), and an automated **24-hour expiration & file purge engine** for guest users.

---

## 🌟 Key Architecture & Capabilities

### 1. ⏱️ 24-Hour Guest Vault & Cloudinary Asset Purge
- **MongoDB TTL Indexes**: Native `{ expireAfterSeconds: 0 }` indices on `expiresAt` fields.
- **Physical File Destruction**: Whenever guest records expire, the cleanup engine destroys assets from Cloudinary (`image` and `raw` resource types) via `cloudinary.uploader.destroy()` to eliminate leftover cloud storage.
- **Scheduled & Lazy Purge**: Cleanup executes on server boot, every hour via `setInterval`, lazily on query, and via the `/api/guest/cleanup` cron route.

### 2. 📁 Multi-Format Cloud Storage (`zlocker/` folder)
- Integrates `multer-storage-cloudinary` with `resource_type: "auto"`.
- Supports Images, PDFs, PowerPoint (`.pptx`), Word (`.docx`), Excel (`.xlsx`), and ZIP archives.
- Tracks file metadata: `fileName`, `fileType`, `fileSize`, and `resourceType`.

### 3. 🔒 Zero-Trust Security & Authorization
- **IDOR Protection**: CRUD operations on member notes and files are strictly scoped to `{ author: authenticated_user_email }`.
- **High Performance Indexing**: Database indexes on `{ author: 1 }` and `{ email: 1 }` guarantee fast queries under load.
- **Serverless & Standalone Dual-Mode**: Works seamlessly both in local Node.js environments and Vercel Serverless `@vercel/node`.

---

## 📡 API Endpoints

### 🔐 Guest Locker Endpoints (No Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/guest/:lockerId` | Fetch all guest notes and files for a locker |
| `POST` | `/api/guest/:lockerId/text` | Save/update note with 24-hour expiration |
| `POST` | `/api/guest/:lockerId/file` | Upload file (image/pdf/pptx/etc.) to Cloudinary |
| `DELETE` | `/api/guest/:lockerId/file/:fileId` | Delete specific file from DB and Cloudinary |
| `DELETE` | `/api/guest/:lockerId` | Self-destruct entire locker and all Cloudinary assets |
| `GET` | `/api/guest/cleanup` | Trigger automated purge of expired assets |

### 👤 Member Notes Endpoints (Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/text/` | Fetch all notes for authenticated user |
| `GET` | `/api/text/:id` | Fetch specific note by ID (scoped to user) |
| `POST` | `/api/text/` | Create a new encrypted/plaintext note |
| `PATCH` | `/api/text/:id` | Update note content (scoped to user) |
| `DELETE` | `/api/text/:id` | Delete note (scoped to user) |

### 🖼️ Member Cloud File Endpoints (Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/image/` | Fetch all cloud files for authenticated user |
| `POST` | `/api/image/` | Upload file into Cloudinary `zlocker/` folder |
| `DELETE` | `/api/image/:id` | Delete file from Cloudinary and MongoDB |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas or local MongoDB instance
- Cloudinary Account (Cloud Name, API Key, API Secret)

### Environment Configuration
Create a `.env` file in the project root:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zlocker?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SECRET_KEY=your_32_byte_aes_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://zlocker.app
```

### Installation
```bash
npm install
npm run build
npm run start:dev
```

---

## 📜 License
Licensed under the [MIT License](LICENSE).
