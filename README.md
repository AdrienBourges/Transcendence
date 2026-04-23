*This project has been created as part of the 42 curriculum by abourges, jinhuang, gholloco, mmedjahe.*

# ft_transcendence

## Description

**ft_transcendence** is a full-stack web application designed as a collaborative social platform for 42 students. The goal of the project is to create a secure and modern web application where users can register, manage their profile, find teammates, create project groups, send invitations, chat in real time, and publish project registration posts.

The project was built with a clear separation between frontend, backend, database, and infrastructure layers. It is containerized with Docker and served through NGINX with HTTPS enabled, so the application can be launched with a single command.

### Project goals

- Build a complete web application from scratch.
- Implement user authentication and secure access control.
- Provide collaboration-oriented features for team formation.
- Practice full-stack architecture, database design, real-time communication, and deployment.
- Deliver a project that is easy to run, review, and extend.

### Key features

- Local authentication with email and password
- 42 OAuth authentication
- User profiles with editable public information
- User search bar and public profile access
- Friend system
- Private one-to-one real-time chat with Socket.IO
- Online presence during chat sessions
- Group creation and management
- Group invitations and membership management
- Project registrations with searchable filters
- Dockerized stack with NGINX reverse proxy and HTTPS

---

## Team Information

| Member | Role(s) | Responsibilities |
|---|---|---|
| **abourges** | Product Owner, Group Lead, Coordination | Defined the global direction of the project, organized the work, clarified technical decisions, coordinated the team, reviewed progress, helped unblock issues across the project, and contributed to documentation / infrastructure / feature follow-up. |
| **jinhuang** | Frontend Developer | Implemented the frontend application, pages, user flows, forms, UI integration with backend endpoints, and most of the client-side experience. |
| **gholloco** | Backend Developer, Database | Worked on backend routes, services, authentication, API logic, business rules, and database-related implementation. |
| **mmedjahe** | Backend Developer, Database | Worked on backend logic, API endpoints, data persistence, database structure, and backend feature implementation. |


---

## Instructions

### Run the project

From the repository root:

```bash
	docker compose up --build
```

This command will:

- start PostgreSQL
- build and start the backend
- build and start the frontend
- start NGINX
- expose the application through HTTPS

### Access the application

Open the application in your browser:

```text
	https://localhost
```

Because the project uses a local development certificate, your browser may display a security warning the first time. This is expected for a self-signed local certificate.

### Useful checks

Health route:

```bash
	curl -k https://localhost/api/health
```

HTTP to HTTPS redirection:

```bash
	curl -I http://localhost
```

Check running services:

```bash
	docker compose ps
```

View logs:

```bash
	docker compose logs -f
```

### Stop the project

In the compose terminal:

```bash
	Ctrl + C
```

Or from another terminal:

```bash
	docker compose down
```

To also remove volumes and reset the database:

```bash
	docker compose down -v
```

---

## Project Management

### Team organization

The team used a practical feature-based workflow:

- requirements and high-level choices were clarified first
- large tasks were split into smaller subtasks
- frontend and backend work were separated as much as possible
- backend API design was documented early to reduce friction with frontend integration
- regular feedback loops were used to validate features progressively
- difficult parts were debugged collaboratively when necessary

### Work distribution

The work was mainly divided into:

- **frontend implementation**
- **backend/API implementation**
- **database/schema design**
- **infrastructure and coordination**
- **documentation and final integration**

### Meetings and follow-up

The team used informal synchronization sessions to:

- decide priorities
- check blockers
- verify backend/frontend compatibility
- review what was finished and what still needed testing

### Tools used for project management

- **GitHub** for repository hosting and pull requests
- **Git branches** for isolated feature work
- **GitHub Issues / board / task breakdown**: 
- **Markdown documentation** inside the repository

### Communication channels

- **Discord**: 

---

## Technical Stack

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **Axios**
- **React Router**
- **Zustand**
- **Socket.IO Client**

### Backend

- **Node.js**
- **Express**
- **TypeScript**
- **Socket.IO**
- **Zod** for input validation
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT-based authentication
- **multer** for avatar upload handling

### Database

- **PostgreSQL**
- **Prisma ORM**

### Infrastructure

- **Docker**
- **Docker Compose**
- **NGINX** reverse proxy
- **HTTPS** with local development certificates

### Why these choices were made

- **React + TypeScript**: good developer experience, clear component model, strong typing, and a modern frontend workflow.
- **Express + TypeScript**: simple and flexible backend stack, easy to organize into routes/controllers/services, good fit for a student full-stack project.
- **PostgreSQL**: reliable relational database, well suited for entities and relationships such as users, groups, invitations, messages, and project registrations.
- **Prisma**: easier schema management, typed database access, cleaner migrations, and better maintainability than raw SQL for this project size.
- **Socket.IO**: practical real-time communication layer for private chat and presence.
- **NGINX + Docker**: simple deployment story, single public entry point, clear separation of services, and a clean way to enforce HTTPS.

---

## Database Schema

### Overview

The database is relational and centered around users, collaboration entities, and messaging.

### Main entities

- **User**
- **Profile**
- **Friendship**
- **Conversation**
- **ConversationParticipant**
- **Message**
- **Group**
- **GroupMember**
- **GroupInvitation**
- **ProjectRegistration**

### Main relationships

- A **User** has one optional **Profile**
- A **User** can have many **Friendship** links
- A **User** can participate in many **Conversation** objects through **ConversationParticipant**
- A **Conversation** contains many **Message** objects
- A **User** can own many **Group** objects
- A **Group** has many **GroupMember** entries
- A **Group** has many **GroupInvitation** entries
- A **User** can create many **ProjectRegistration** entries

### Key fields and types

#### User
- `id: Int`
- `email: String?`
- `username: String`
- `passwordHash: String?`
- `oauth42Id: String?`
- `authProvider: String`
- `createdAt: DateTime`

#### Profile
- `id: Int`
- `userId: Int`
- `avatarUrl: String?`
- `languages: String?`
- `discord: String?`
- `pronouns: String?`

#### Group
- `id: Int`
- `name: String`
- `description: String?`
- `projectName: ProjectName`
- `deadline: DateTime?`
- `isBonus: Boolean`
- `ownerId: Int`
- `createdAt: DateTime`

#### GroupMember
- `id: Int`
- `userId: Int`
- `groupId: Int`
- `role: String`
- `joinedAt: DateTime`

#### GroupInvitation
- `id: Int`
- `groupId: Int`
- `invitedById: Int`
- `invitedUserId: Int`
- `status: String`
- `createdAt: DateTime`

#### ProjectRegistration
- `id: Int`
- `userId: Int`
- `projectName: ProjectName`
- `deadline: DateTime?`
- `isBonus: Boolean`
- `description: String?`
- `createdAt: DateTime`

#### Conversation / Message
- `Conversation.id: Int`
- `Message.id: Int`
- `Message.convId: Int`
- `Message.senderId: Int`
- `Message.content: String`
- `Message.createdAt: DateTime`

## Features List

| Feature | Description | Team member(s) |
|---|---|---|
| User registration | Users can create an account with email, username, and password. | gholloco, mmedjahe |
| Local login/logout | Users can authenticate with JWT-based login. | gholloco, mmedjahe |
| 42 OAuth login | Users can sign in with their 42 account. | gholloco, mmedjahe |
| User profile | Users can access and update public profile data. | jinhuang, gholloco, mmedjahe |
| Avatar upload | Users can upload an avatar image. | gholloco, mmedjahe |
| User search | Search bar to find users by username and open their profile. | jinhuang, gholloco, mmedjahe |
| Friend system | Users can add or remove friends and see their friend list. | gholloco, mmedjahe, jinhuang |
| Private conversations | Users can open private conversations. | gholloco, mmedjahe, jinhuang |
| Real-time chat | Messages are exchanged through Socket.IO in real time. | gholloco, mmedjahe, jinhuang |
| Online presence | Presence is shown while chat sessions are active. | gholloco, mmedjahe, jinhuang |
| Group creation | Users can create project groups with project, bonus, and deadline data. | gholloco, mmedjahe, jinhuang |
| Group management | Users can consult group details, members, and owner actions. | gholloco, mmedjahe, jinhuang |
| Group invitations | Owners can invite users to join groups; users can accept or reject invitations. | gholloco, mmedjahe, jinhuang |
| Project registrations | Users can publish project registration posts and browse them with filters. | gholloco, mmedjahe, jinhuang |
| HTTPS / NGINX / Docker | Full stack runs through Docker with NGINX and HTTPS. | abourges |
| Coordination / documentation | Feature planning, task split, docs, integration follow-up. | abourges |


---

## Modules

### Chosen modules

-> • Major (+2) : Use a framework for both the frontend and backend. 

-> • Major (+2): Allow users to interact with other users.

-> • Major (+2): An organization system

-> • Minor (+1): Implement advanced search functionality with filters, sorting, and  pagination.

-> • Major (+2): Standard user management and authentication:

->•  Minor (+1): A complete notification system for all creation, update, and deletion actions. 

-> • Minor (+1): Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).

-> • Minor (+1): Use an ORM for the database.

-> • Major (+2): Implement real-time features using WebSockets or similar technology

-> • Minor (+1): Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components). 

-> • Minor (+1) : Support for additional browsers. 


---

## Individual Contributions

### abourges

- Group leader / PO responsibilities
- Defined priorities and helped structure the work
- Coordinated the team and clarified tasks
- Followed integration between frontend and backend
- Helped on debugging and cross-feature issues
- Worked on infrastructure / Docker / NGINX / HTTPS / documentation

### jinhuang

- Implemented the frontend application
- Built the main pages and user flows
- Integrated frontend components with backend endpoints
- Worked on interface behavior for profiles, groups, search, and project registration pages

### gholloco

- Worked on backend feature implementation
- Contributed to authentication, API routes, services, and business logic
- Contributed to database-related backend work

### mmedjahe

- Worked on backend feature implementation
- Contributed to database design and persistence logic
- Worked on backend routes, services, and project feature support

### Challenges and how they were overcome

Some of the main challenges of the project included:

- keeping frontend and backend aligned while the API evolved
- managing Prisma migrations and schema changes safely
- implementing real-time chat and presence with a simple, maintainable model
- dealing with routing and redirection issues in OAuth flows
- integrating Docker, NGINX, and HTTPS without overcomplicating the stack

These issues were handled through iterative testing, API clarification, small-step debugging, and regular coordination between frontend and backend work.

---

## Infrastructure and Security Notes

- The application is launched with **one command** using Docker Compose.
- **NGINX** is the only public entry point.
- The backend is accessed publicly through **HTTPS**.
- The backend container is **not exposed directly** to the host.
- PostgreSQL is **not exposed directly** to the host in the final stack.
- Client requests to `/api` pass through NGINX.
- Socket.IO traffic is proxied through NGINX.


## Resources

### Technical references

- React documentation: https://react.dev/
- Vite documentation: https://vite.dev/
- TypeScript documentation: https://www.typescriptlang.org/docs/
- Express documentation: https://expressjs.com/
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Prisma documentation: https://www.prisma.io/docs
- Socket.IO documentation: https://socket.io/docs/v4/
- Docker documentation: https://docs.docker.com/
- Docker Compose documentation: https://docs.docker.com/compose/
- NGINX documentation: https://nginx.org/en/docs/
- 42 API documentation: https://api.intra.42.fr/apidoc
- Zod documentation: https://zod.dev/

### Tutorials / general references

- MDN Web Docs: https://developer.mozilla.org/
- web.dev: https://web.dev/
- PostgreSQL tutorial resources: https://www.postgresqltutorial.com/
- Prisma guides and examples: https://www.prisma.io/docs/orm/prisma-client

### How AI was used

AI tools were used as a support tool during the project, mainly for:

- understanding unfamiliar documentation faster
- comparing technical options and stack choices
- breaking large features into smaller implementation steps
- debugging TypeScript, Prisma, Docker, NGINX, and networking issues
- reviewing API structure and route consistency
- improving written documentation and README drafting

AI was **not** used as a substitute for implementation ownership. The final code, architecture decisions, testing, and integration were reviewed and validated by the team.

---

## Known Limitations / Possible Improvements

- The local HTTPS certificate is intended for development/demo use.
- Some polling-based frontend refresh behavior could be optimized.
- Some feature areas can still be refined in terms of UX polish and error feedback.
- Production deployment would require stronger environment separation and certificate management.

---

## Credits

This project was developed by the team listed at the top of this README as part of the **42 curriculum**.
