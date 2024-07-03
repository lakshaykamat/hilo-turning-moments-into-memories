# SyncTalk - Socialize in a New Way

SyncTalk is a dynamic web chat application and post-sharing platform designed to revolutionize how you connect and interact with others. Built on the MERN stack and Next.js, SyncTalk allows you to like, comment on, and share posts. You can also add friends to enhance your social network experience.

## Features

### Chat Functionality
- **Real-time Messaging**: Engage in real-time conversations with friends and groups.
- **Message Notifications**: Receive instant notifications for new messages.
- **Media Sharing**: Share photos, videos, and files seamlessly within chats.
- **Typing Indicators**: See when your friends are typing.

### Post Sharing
- **Create Posts**: Share your thoughts, photos, and updates with your network.
- **Like and Comment**: Interact with posts through likes and comments.
- **Share Posts**: Amplify content by sharing posts within the platform.
- **User Profiles**: View and interact with user profiles to learn more about your friends and followers.

### Friend Management
- **Add Friends**: Connect with others by sending and accepting friend requests.
- **Friend List**: Maintain a list of friends for easy access and interaction.
- **Privacy Settings**: Control who can see your posts and send you friend requests.

### Authentication and Security
- **User Authentication**: Secure sign-up and login using JWT tokens.
- **Password Encryption**: Protect user passwords with bcrypt hashing.
- **Session Management**: Ensure secure session handling and automatic logout on inactivity.

## Technologies Used

### Frontend
- **Next.js**: A powerful React framework for building server-side rendered applications.
- **React**: A popular JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.

### Backend
- **Node.js**: A JavaScript runtime built on Chrome's V8 engine for building fast and scalable server applications.
- **Express.js**: A minimal and flexible Node.js web application framework.
- **MongoDB**: A NoSQL database for storing user data, posts, and chat messages.
- **Mongoose**: An elegant MongoDB object modeling tool for Node.js.

## Getting Started

### Prerequisites
- **Node.js** (v14.x or later)
- **MongoDB** (local or cloud instance)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lakshaykamat/synctalk.git
   cd synctalk
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add the following environment variables:
   ```env
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   ```

4. **Run the Application**
   ```bash
   # In the root directory, run the backend server
   npm run dev

   # In the client directory, run the frontend server
   cd client
   npm run dev
   ```

5. **Open Your Browser**
   Navigate to `http://localhost:3000` to access the application.

## Contributing

We welcome contributions to make SyncTalk even better! Please fork the repository and submit a pull request for any enhancements or bug fixes.

### Steps to Contribute
1. Fork the repository.
2. Create a new branch.
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes.
4. Commit your changes.
   ```bash
   git commit -m "Add feature: your feature name"
   ```
5. Push to your branch.
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a pull request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue or contact us at [lakshaykamat.dev@gmail.com].

---

Enjoy connecting and sharing with SyncTalk!
