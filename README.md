# 🔧 AI PLANNER BACKEND - Complete Structure

## 📁 Project Structure

```
ai-planner-backend/
│
├── package.json                          ✅ Generated
├── tsconfig.json                         (Create)
├── .env                                  (Create - Config)
├── .gitignore
├── README.md
│
├── src/
│   ├── server.ts                         # Express server entry
│   ├── app.ts                            # Express app configuration
│   │
│   ├── config/
│   │   ├── firebase.ts                   # Firebase Admin SDK
│   │   ├── n8n.ts                        # n8n configuration
│   │   └── constants.ts                  # App constants
│   │
│   ├── middleware/
│   │   ├── auth.ts                       # JWT authentication
│   │   ├── validate.ts                   # Request validation
│   │   ├── errorHandler.ts               # Error handling
│   │   └── rateLimiter.ts                # Rate limiting
│   │
│   ├── routes/
│   │   ├── index.ts                      # Route aggregator
│   │   ├── auth.routes.ts                # Authentication
│   │   ├── planners.routes.ts            # Planner CRUD
│   │   ├── sections.routes.ts            # Section CRUD
│   │   ├── sharing.routes.ts             # Sharing & permissions
│   │   ├── activity.routes.ts            # Activity logs
│   │   ├── ai.routes.ts                  # AI chat
│   │   ├── export.routes.ts              # PDF export
│   │   ├── calendar.routes.ts            # Calendar sync
│   │   └── handwriting.routes.ts         # Handwriting OCR
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts            # Auth logic
│   │   ├── planners.controller.ts        # Planner operations
│   │   ├── sections.controller.ts        # Section operations
│   │   ├── sharing.controller.ts         # Sharing logic
│   │   ├── activity.controller.ts        # Activity logging
│   │   ├── ai.controller.ts              # AI integration
│   │   ├── export.controller.ts          # Export logic
│   │   ├── calendar.controller.ts        # Calendar integration
│   │   └── handwriting.controller.ts     # OCR processing
│   │
│   ├── services/
│   │   ├── firebase.service.ts           # Firestore operations
│   │   ├── n8n.service.ts                # n8n workflow calls
│   │   ├── auth.service.ts               # Auth business logic
│   │   ├── planner.service.ts            # Planner business logic
│   │   ├── sharing.service.ts            # Sharing business logic
│   │   ├── pdf.service.ts                # PDF generation
│   │   └── ocr.service.ts                # Handwriting recognition
│   │
│   ├── models/
│   │   ├── types.ts                      # TypeScript interfaces
│   │   └── validators.ts                 # Validation schemas
│   │
│   └── utils/
│       ├── logger.ts                     # Winston logger
│       ├── errors.ts                     # Custom errors
│       ├── helpers.ts                    # Helper functions
│       └── dateUtils.ts                  # Date utilities
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── dist/                                 # Compiled JavaScript
```

## 📊 File Count: ~35 Files

---

## 🎯 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/apple` - Apple OAuth
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Planners
- `GET /api/planners` - Get all user planners
- `POST /api/planners` - Create planner
- `GET /api/planners/:id` - Get planner by ID
- `PUT /api/planners/:id` - Update planner
- `DELETE /api/planners/:id` - Delete planner
- `POST /api/planners/:id/duplicate` - Duplicate planner
- `PUT /api/planners/:id/default` - Set as default

### Sections
- `GET /api/planners/:plannerId/sections` - Get sections for date
- `POST /api/planners/:plannerId/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section
- `PUT /api/sections/reorder` - Reorder sections
- `PUT /api/sections/:id/collapse` - Toggle collapse

### Sharing
- `POST /api/planners/:id/share` - Share planner
- `GET /api/planners/:id/shares` - Get planner shares
- `PUT /api/shares/:id/permission` - Update permission
- `DELETE /api/shares/:id` - Remove share
- `POST /api/shares/:id/accept` - Accept invitation
- `GET /api/shares/pending` - Get pending invitations

### Activity Logs
- `GET /api/planners/:id/activity` - Get activity logs
- `POST /api/activity` - Log activity

### AI Assistant
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/history` - Get chat history
- `DELETE /api/ai/history` - Clear history
- `POST /api/ai/suggest-meals` - Meal suggestions
- `POST /api/ai/generate-schedule` - Schedule generation
- `POST /api/ai/analyze-habits` - Habit analysis

### Export
- `POST /api/export/pdf` - Export to PDF
- `GET /api/export/:id` - Download export

### Calendar
- `POST /api/calendar/sync` - Sync with Google Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/import` - Import events
- `POST /api/calendar/export` - Export events

### Handwriting
- `POST /api/handwriting/convert` - Convert to text
- `POST /api/handwriting/save` - Save drawing

---

## 🔐 Authentication Flow

```
1. User sends credentials → Backend validates
2. Backend creates Firebase user
3. Backend generates JWT token
4. Return token to client
5. Client includes token in Authorization header
6. Middleware verifies token on protected routes
```

---

## 🗄️ Database Structure (Firestore)

```
users/
└── {userId}/
    ├── email
    ├── displayName
    ├── photoURL
    └── preferences

planners/
└── {plannerId}/
    ├── userId
    ├── title
    ├── color
    ├── icon
    ├── isDefault
    └── dates/
        └── {dateStr}/
            └── sections/
                └── {sectionId}/

planner_shares/
└── {shareId}/
    ├── plannerId
    ├── ownerId
    ├── sharedWithUserId
    ├── permission
    └── isAccepted

activity_logs/
└── {logId}/
    ├── plannerId
    ├── userId
    ├── activityType
    └── timestamp
```

---

## 🌐 n8n Workflow Endpoints

```
AI Chat: https://your-n8n.com/webhook/ai-chat
PDF Export: https://your-n8n.com/webhook/export-pdf
Calendar Sync: https://your-n8n.com/webhook/calendar-sync
Handwriting OCR: https://your-n8n.com/webhook/handwriting-to-text
Meal Planning: https://your-n8n.com/webhook/generate-meal-plan
Schedule Generation: https://your-n8n.com/webhook/generate-schedule
Habit Analysis: https://your-n8n.com/webhook/analyze-habits
```

---

## ⚡ Starting Now: Generating All Backend Files

I'll create all 35 files systematically!