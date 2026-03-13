<a name="_9mu6e3mqbg65"></a>				**TRANSCENDENCE BRIEF**


**PARTNERS42 :** *A social web app for 42 students to register, find teammates, create groups, invite other students, add friends, and chat. (**name is temporary**)*


1. **MAIN FEATURES**

1) ***User account***

**-> Users** should be able to** create an account using **email+password** or **42 account**. (**Email+password** is unfortunately mandatory according to the subject: “ *Users must be able to sign up and log in securely: ◦ At minimum: email and password authentication with proper security (hashed passwords, salted, etc.).” )* 

***->*  Users** can update their profile information (avatar, main languages, discord, age, pronouns, …). From this list: Only **avatar** change is mandatory, the rest is optional.

**->** **Users** have a **profile page** displaying their information. Other users will be able to see those information by going on the profile page

1) ***Interaction between users***

**-> Users** can add other users as **friends to their friendlist** and see their online status. Friendlist of the user will be accessible through a page. The user can also **delete** a friend.

**-> Basic chat system:** A User can interact with another user using text message 

**->** **Create a group:** A user can create a **group**. A form will need to be filled with those categories: **What project**, **Deadline date**, **Bonus or not**, and a **blank space** allowing more details to be added (character limited). 

**Group creator / owner**

- can edit group information
- can remove members
- can delete the group (leading to all members being deleted from the group)
- cannot leave the group

**Regular group member**

- can leave the group
- can invite other users to the group
- cannot edit group information
- cannot remove members
- cannot delete the group

**-> Send invites:** Any user of any group can invite another user to a group.

**-> Notification:** A user that receives an invite will receives in-app notification. A user that received a message sees an **unread message indicator** for private chats

**-> Accept/Decline invites:** A user that receives an invite will be able to accept or decline the invite. Accepting the invite will automatically add him to the group. Declining will remove the notification. 

**-> Register for a project:** A single user can register himself for a project and appear in our search tool as looking for a group. User need to fill a form with those categories: **What project**, **Deadline date**, **Bonus** or not**, and blank space** allowing more details to be added (character limited). (Categories would ideally be the same as the group creation so both can be searched at the same time through our search tool)

1) ***Other / under the hood features***

**->** **Search tool**: A user can search for another user/group that is already registered for a given project. **Search filters** (User/group, Deadline date, Bonus/no bonus) can be used to get more specific results.User **don’t need** to be **logged in** to use the search tool.

**-> The whole website** will be available in **french/english/mandarin.** User-generated content is not translated. Language can be changed on the UI.

**->** Our app will expose a documented API with at least 5 endpoints, protected by authentication and rate limiting

**->** Implementation **WAF/ModSecurity** (hardened) + **HashiCorp Vault** for secrets (Cybersecurity module)

->Whole project needs to be dockerized


**2. OPTIONAL FEATURES** 

**-> Group Chat:** The creation of a group will also create a chat between member of the group. Every time a member is added to the group, he is also added to the group chat.

-> **CHAT**: Users will be able to exchange files.

**->** The **sender** of the **group invitation** can be notified of the **acceptation/refusal** of the invite

**->Find a friend:** A user can simply search for people that meets certain criteria (language, age, pronouns… depending on what parameters will be added to the profile) 


**3. MODULES**

1) ***Mandatory modules***

**->** • **Major (+2) :** Use a framework for both the frontend and backend. 

◦ Use a frontend framework (React, Vue, Angular, Svelte, etc.). 

◦ Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails, etc.).

**-> •** **Major (+2)**: Allow users to interact with other users.

` `The minimum requirements are: 

◦ A basic chat system (send/receive messages between users). 

◦ A profile system (view user information). 

◦ A friends system (add/remove friends, see friends list).

**-> • Major (+2)**: An organization system:

◦ Create, edit, and delete organizations. 

◦ Add users to organizations. 

◦ Remove users from organizations. 

◦ View organizations and allow users to perform specific actions within an organization (minimum: create, read, update). 

-**> • Minor (+1):** Implement advanced search functionality with filters, sorting, and  pagination.

**-> • Minor (+1)**: Support for multiple languages (at least 3 languages). 

◦ Implement i18n (internationalization) system. 

◦ At least 3 complete language translations. 

◦ Language switcher in the UI. 

◦ All user-facing text must be translatable. 

**-> • Major (+2):** Standard user management and authentication:

◦ Users can update their profile information. 

◦ Users can upload an avatar (with a default avatar if none provided). 

◦ Users can add other users as friends and see their online status. 

` `Users have a profile page displaying their information.

**-> • Major (+2):** A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints.

**-> • Major (+2) :** Implement WAF/ModSecurity (hardened) + HashiCorp Vault for secrets: 

◦ Configure strict ModSecurity/WAF. 

◦ Manage secrets in Vault (API keys, credentials, environment variables), encrypted and isolated.

**->•  Minor (+1)**: A complete notification system for all creation, update, and deletion actions. 

-> • **Minor (+1)**: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).

1) ***Optional Modules***

**-> • Minor (+1):** Use an ORM for the database.

**-> • Minor (+1)**: Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components). 

**-> • Minor (+1):** File upload and management system. 

◦ Support multiple file types (images, documents, etc.).

` 	`◦ Client-side and server-side validation (type, size, format).

` 	`◦ Secure file storage with proper access control.

` `◦ File preview functionality where applicable. 

◦ Progress indicators for uploads. 

◦ Ability to delete uploaded files

**-> • Major (+2):** Monitoring system with Prometheus and Grafana. 

◦ Set up Prometheus to collect metrics. 

◦ Configure exporters and integrations. 

◦ Create custom Grafana dashboards.

` `◦ Set up alerting rules. 

◦ Secure access to Grafana

**-> • Minor (+1):** Data export and import functionality. 

◦ Export data in multiple formats (JSON, CSV, XML, etc.). 

◦ Import data with validation. 

◦ Bulk operations support.

**-> • Minor (+1)** : Support for additional browsers. 

◦ Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.). 

◦ Test and fix all features in each browser. 

◦ Document any browser-specific limitations. 

◦ Consistent UI/UX across all supported browsers.

**-> • Minor (+1):** Implement a complete 2FA (Two-Factor Authentication) system for the users. 
