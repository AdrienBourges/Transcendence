# <a name="_6e1ek6rf2lrc"></a>**TECHNICAL CHOICES**


**FRONTEND**

→ **React + Vite + Typescript:** React **=** simple to use, popular. Vite = build tool very easy to install/use. TypeScript adds type checking on top of JavaScript, which helps catch mistakes earlier.

**FRONTEND ROUTING**

**–> React router =** main routing solution in React.

**FRONTEND STYLING**

**→ Bootstrap (css framework):** lots of prebuilt components, easy to make it work, less design effort at the beginning

**BACKEND**

**→ Express+Typescript** = minimal and flexible, easy for beginners. 

**DATABASE**

**→ PostgreSQL:** users, profiles, groups, memberships, invites, friendships, conversations, messages, notifications = natural fit for postgreSQL, standard choice.

**NORMAL APP ACTIONS**

**→ REST API:** signup, login, logout, get my profile, update, profile upload, avatar update, group edit ,group delete, group creation, send invite, accept / decline, invite friendslist, search users/groups, fetch old messages from a conversation, fetch notifications page,... 

**LIVE APP ACTIONS**

**→ SOCKET.IO (Websocket)**: Live CHAT + Online status and possibly notification of a new message. These will be live.

**HTTPS/REVERSE PROXY**

**→ nginx:** most standard choice, we already had a good approach in inception. Will be placed between frontend and backend to ensure secured data transfer.

**CONTAINERIZATION**

**→ Docker** (4 containers: frontend, backend, database and reverse proxy to handle HTTPS, 2 containers might be added for ModSecurity / WAF + Vault)

**TRANSLATION**

→ **react-i18next:** multilingual UI support for French, English, and Mandarin.
