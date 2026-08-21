# TeamFlow — Development Documentation

> Full-stack project built with Spring Boot + MongoDB + React.
>
> **Purpose:** A portfolio/flagship project for learning real-world backend and full-stack development, while building something that can later be extended with security, authorization, AI, caching, messaging, and production features.

---

# 1. Project Overview

## What is TeamFlow?

TeamFlow is a team/project management application.

The application will allow users to:

- Create and manage projects
- Create and manage tasks
- Assign tasks to users
- Organize users into teams
- Track task status and priority
- Authenticate securely
- Use role-based authorization
- Eventually interact with the application through a React frontend
- Eventually integrate AI features

The initial implementation focuses on building a strong backend before adding advanced infrastructure and AI.

---

# 2. Technology Stack

## Current / Planned

### Backend
- Java
- Spring Boot
- Spring Data MongoDB
- MongoDB Atlas
- REST APIs
- Lombok
- Spring Security
- JWT

### Frontend
- React
- API integration with Spring Boot

### Later / Advanced
- Docker
- Redis
- Kafka
- CI/CD
- AI / RAG / Agentic AI

> Kafka, Redis and other advanced infrastructure are intentionally postponed until the core application is working.

---

# 3. Architecture

The planned application follows a layered architecture:

```text
React Frontend
       ↓
REST Controller
       ↓
DTO
       ↓
Service
       ↓
Entity
       ↓
Repository
       ↓
MongoDB
```

Security will eventually sit in front of protected API requests:

```text
Client
  ↓
Spring Security
  ↓
JWT Authentication
  ↓
Authorization / Roles
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MongoDB
```

---

# 4. Development Progress

## Phase 1 — Project Setup + User CRUD ✅

### Completed

1. Created Spring Boot project using Spring Initializr.
2. Started and verified the Spring Boot application.
3. Configured MongoDB Atlas.
4. Connected Spring Boot to MongoDB.
5. Created the `User` entity.
6. Created the User repository.
7. Created the User service.
8. Created the User controller.
9. Tested basic User CRUD.

### Concepts learned

- Spring Boot application structure
- Dependency Injection
- Controller
- Service
- Repository
- Entity
- MongoDB
- MongoDB Atlas
- Basic CRUD
- Request flow through Spring Boot

### Basic Spring Boot workflow

```text
HTTP Request
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
MongoDB
```

The Controller receives the request, the Service contains business logic, and the Repository communicates with MongoDB.

---

# 5. Phase 2 — DTOs + Project CRUD ✅

## User DTOs

The existing User API was refactored to use DTOs.

Created / planned:

- `CreateUserRequest`
- `UpdateUserRequest`
- `UserResponse`

## Project Module

Created:

- Project entity
- Project repository
- Project service
- Project controller
- Project CRUD APIs

## Project DTOs

Created / planned:

- `CreateProjectRequest`
- `UpdateProjectRequest`
- `ProjectResponse`

## DTO workflow

### Request

```text
Client
  ↓
CreateProjectRequest
  ↓
Controller
  ↓
Service
  ↓
Project Entity
  ↓
Repository
  ↓
MongoDB
```

### Response

```text
MongoDB
  ↓
Project Entity
  ↓
Service
  ↓
ProjectResponse
  ↓
Controller
  ↓
Client
```

## Why DTOs?

Entities should not be exposed directly through the API.

DTOs allow the API to control:

- What data clients can send
- What data clients can receive
- Which fields can be updated
- Separation between database models and API contracts

---

# 6. MongoDB IDs

MongoDB automatically generates unique IDs for documents.

Example:

```text
68a5f3c91e2b7a4d8f123456
```

The application does not manually generate these IDs.

When a Project is created:

```text
Create Project
      ↓
MongoDB
      ↓
MongoDB generates ID
      ↓
Project now has its ID
```

That ID can later be stored as a reference inside another document.

For example:

```text
Project
id = 68a5...

Task
projectId = 68a5...
```

This is how a Task will be associated with a Project.

---

# 7. Phase 3 — Task Management 🚧 CURRENT

## Goal

Build the Task management module and introduce relationships between:

```text
User
  ↓
Task
  ↓
Project
```

A Task belongs to a Project and can be assigned to a User.

---

## 7.1 Task Entity

### Current implementation

```java
@Document(collection = "tasks")
@Data
public class Task {
    private String id;
    private String title;
    private String description;
    private String projectId;
    private String assignedTo;
    private String createdBy;
    private String status;
    private String priority;
    private String deadline;
    private Date createdAt;
    private Date updatedAt;
}
```

### Meaning of fields

| Field | Purpose |
|---|---|
| `id` | MongoDB-generated unique identifier |
| `title` | Short name of the task |
| `description` | Detailed task description |
| `projectId` | ID of the Project this task belongs to |
| `assignedTo` | ID of the User responsible for the task |
| `createdBy` | ID of the User who created the task |
| `status` | Current state of the task |
| `priority` | Importance/urgency of the task |
| `deadline` | Expected completion date |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last modification timestamp |

---

## 7.2 Task Relationships

### Task → Project

```text
Project
   │
   ├── Task 1
   ├── Task 2
   └── Task 3
```

The Task stores the Project's ID:

```text
Task.projectId = Project.id
```

### Task → User

A Task can be assigned to a User:

```text
User
  │
  └── assignedTo → Task
```

The Task also records who created it:

```text
Task.createdBy = User.id
```

---

## 7.3 Task DTOs

Next, create:

- `CreateTaskRequest`
- `UpdateTaskRequest`
- `TaskResponse`

The Task entity should not be directly exposed through the API.

---

## 7.4 Task Repository

Create a repository responsible for communicating with MongoDB for Task documents.

Expected responsibility:

```text
Task Service
     ↓
Task Repository
     ↓
MongoDB
```

---

## 7.5 Task Service

The service will contain Task business logic.

Initial responsibilities:

- Create task
- Find all tasks
- Find task by ID
- Update task
- Delete task
- Verify Project exists
- Verify User exists
- Validate task-related business rules

---

## 7.6 Task Controller

Initial REST API:

```text
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/{id}
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

Later:

```text
PATCH  /api/tasks/{id}/status
```

for status-specific operations.

---

## 7.7 Task Status

Initial status values:

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
```

## Task Priority

Initial priority values:

```text
LOW
MEDIUM
HIGH
URGENT
```

These will eventually be represented more safely using enums.

---

## 7.8 Task Business Rules

Initial rules:

1. A Task must belong to an existing Project.
2. If a Task is assigned to a User, that User must exist.
3. Task status must be a valid status.
4. Task priority must be a valid priority.
5. Task IDs are generated by MongoDB.
6. Project IDs and User IDs are references stored in the Task.

Later, additional rules will be introduced through teams and authorization.

---

# 8. How Task Creation Will Work

Eventually, a user will open a Project in the frontend:

```text
Projects
  ↓
E-Commerce Platform
  ↓
Tasks
  ↓
Add Task
```

The frontend already knows the Project ID.

Example:

```text
projectId = 68a5f3c91e2b7a4d8f123456
```

The request reaches the backend:

```text
React
  ↓
POST /api/tasks
  ↓
TaskController
  ↓
CreateTaskRequest
  ↓
TaskService
  ↓
Check Project exists
  ↓
Check assigned User exists
  ↓
Create Task Entity
  ↓
TaskRepository
  ↓
MongoDB
```

MongoDB generates the Task's own ID.

The Task then contains:

```text
Task
├── id          → generated by MongoDB
├── projectId   → existing Project ID
├── assignedTo  → existing User ID
└── createdBy   → existing User ID
```

---

# 9. Remaining Development Roadmap

## Phase 3 — Task Management 🚧

- [ ] Task Entity
- [ ] Task DTOs
- [ ] Task Repository
- [ ] Task Service
- [ ] Task Controller
- [ ] Task CRUD
- [ ] Project reference
- [ ] User assignment
- [ ] Task status
- [ ] Task priority
- [ ] Basic validation
- [ ] Project existence validation
- [ ] User existence validation
- [ ] Postman testing

### Milestone

A Task can be:

```text
Created
↓
Assigned to a User
↓
Associated with a Project
↓
Retrieved
↓
Updated
↓
Deleted
```

---

# 10. Phase 4 — Teams

Planned:

- Team entity
- Team CRUD
- Team members
- User ↔ Team relationship
- Project ↔ Team relationship
- Team-based business rules
- Task assignment restrictions

Example:

```text
Team
 ├── User A
 ├── User B
 └── User C
      ↓
   Project
      ↓
    Tasks
```

---

# 11. Phase 5 — Authentication

Learn and implement:

- Registration
- Password hashing
- Login
- JWT generation
- JWT structure
- JWT expiration
- Authentication filter
- Spring Security filter chain
- Authentication context
- Protected endpoints

Basic flow:

```text
Register
   ↓
Hash Password
   ↓
Save User

Login
   ↓
Verify Credentials
   ↓
Generate JWT
   ↓
Client receives JWT
```

---

# 12. Phase 6 — Role-Based Authorization

Planned roles:

- `ADMIN`
- `PROJECT_MANAGER`
- `DEVELOPER`
- `USER`

Authorization will determine:

> Who can perform which operation?

Example:

```text
ADMIN
→ Manage users

PROJECT_MANAGER
→ Create/manage projects
→ Create/assign tasks

DEVELOPER
→ Work on assigned tasks

USER
→ Limited access
```

The exact permission model will be finalized while implementing security.

---

# 13. Phase 7 — Exception Handling + API Quality

Implement:

- Custom exceptions
- Global exception handler
- Validation errors
- Resource-not-found errors
- Duplicate data errors
- Authentication errors
- Authorization errors
- Consistent HTTP status codes
- Professional API error responses

---

# 14. Phase 8 — React Frontend

Build the frontend using React.

Planned screens:

```text
Login
Register
Dashboard
Projects
Project Details
Tasks
Teams
Profile
```

Frontend will consume the actual Spring Boot APIs.

Architecture:

```text
React
  ↕
REST API
  ↕
Spring Boot
  ↕
MongoDB
```

Planned frontend concepts:

- Components
- React Router
- Forms
- API calls
- Authentication
- Token handling
- Protected routes
- Role-based UI
- Loading states
- Error handling

---

# 15. Phase 9 — Testing

Begin with:

- Postman API testing
- Service tests
- Controller tests
- Repository tests
- Security tests
- Integration tests

Testing will be introduced progressively rather than trying to write every test immediately.

---

# 16. Phase 10 — Deployment

Planned deployment:

```text
React Frontend
      ↓
Internet
      ↓
Spring Boot Backend
      ↓
MongoDB Atlas
```

Topics:

- Environment variables
- Secrets
- CORS
- Production configuration
- MongoDB Atlas production setup
- Backend deployment
- Frontend deployment
- Basic production security

---

# 17. Future Advanced Features

These are intentionally postponed until the core application works.

## Infrastructure

- Redis
- Kafka
- Docker
- CI/CD
- Caching
- Rate limiting
- Monitoring

## Advanced backend

- Pagination
- Filtering
- Search
- Notifications
- File uploads
- Activity logs

## AI

- LLM integration
- RAG
- AI assistant
- Agentic AI
- AI-powered task/project analysis

---

# 18. Project Philosophy

The goal is NOT to use as many technologies as possible.

The goal is to build a project that can be explained deeply.

For every major feature, understand:

```text
What is it?
Why do we need it?
Where does it fit?
How does it work?
Why did we choose this approach?
What alternatives exist?
```

AI can be used as a mentor/learning assistant, but every implementation should be understood before moving forward.

---

# 19. Learning Strategy

For the development sprint:

```text
Understand
   ↓
Design
   ↓
Learn the new concept
   ↓
Implement
   ↓
Test
   ↓
Explain it back
   ↓
Move forward
```

Avoid tutorial hell.

The project itself is the primary learning environment.

---

# 20. Flagship Project Goal

The final project should be something that can genuinely be discussed in a backend/full-stack interview.

The important outcome is not simply:

> "I built a Spring Boot project."

It should become:

> "I designed and built a full-stack project management system with REST APIs, MongoDB, DTO-based architecture, authentication, JWT, role-based authorization, React integration, validation, exception handling, and eventually production-oriented infrastructure and AI capabilities."

---

# Master Roadmap

```text
PHASE 1 ✅
Project Setup + User CRUD
        ↓
PHASE 2 ✅
DTOs + Project CRUD
        ↓
PHASE 3 🚧
Task Management
        ↓
PHASE 4
Teams + Relationships
        ↓
PHASE 5
Authentication + JWT + Spring Security
        ↓
PHASE 6
Role-Based Authorization
        ↓
PHASE 7
Validation + Exception Handling + API Quality
        ↓
PHASE 8
React Frontend
        ↓
PHASE 9
Testing
        ↓
PHASE 10
Deployment
        ↓
VERSION 2
Redis + Kafka + Docker + CI/CD
        ↓
VERSION 3
AI + RAG + Agentic AI
```

---

## Current Position

**Phase 1:** ✅ Complete  
**Phase 2:** ✅ Complete  
**Phase 3:** 🚧 In progress

### Immediate next step

Complete the Task module in this order:

```text
1. Task Entity                    ✅ Started
2. Task DTOs
3. Task Repository
4. Task Service
5. Task Controller
6. Task CRUD
7. Project/User relationship validation
8. Status + Priority handling
9. Validation
10. Postman testing
```

**Current task: #2 — Task DTOs.**
