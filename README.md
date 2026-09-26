# BYOK (Bring Your Own Key)

BYOK is a modern, privacy-focused AI workspace that allows users to seamlessly integrate and manage their own API keys to interact with various large language models (LLMs). Built with a focus on premium aesthetics and performance, BYOK provides a centralized hub for chatting, managing models, and tracking analytics.

## 🚀 Features

- **Bring Your Own Key (BYOK)**: Securely manage your own API keys for different AI providers without paying for a middleman subscription.
- **Advanced Chat Interface**: Rich text support, markdown rendering, and LaTeX (KaTeX) math support for interacting with AI models.
- **Model Management**: Select and configure your preferred models.
- **Usage Analytics**: Keep track of your API usage and token consumption.
- **Premium UI/UX**: Built with Tailwind CSS, Framer Motion, GSAP, and Spline 3D for a stunning, glassmorphism-inspired, and highly interactive user experience.
- **Secure Authentication**: Integrated with Firebase Authentication for safe access control.

## 🛠 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **3D Graphics**: [Spline React](https://spline.design/) & [OGL](https://github.com/oframe/ogl)
- **Backend & Auth**: [Firebase](https://firebase.google.com/)
- **Markdown & Math**: `react-markdown`, `remark-math`, `rehype-katex`

## 📂 Project Structure

```
src/
├── components/   # Reusable UI components
├── pages/        # Application routes (Home, Auth, Workspace, Chat, Analytics, etc.)
├── store/        # Zustand state stores
├── providers/    # Context providers (Auth, Theme, etc.)
├── lib/          # Utility functions and API clients
├── routing/      # Route definitions and guards
└── assets/       # Static assets (images, fonts, etc.)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/darshohri/BYOK.git
   cd BYOK
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # Add other required environment variables
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## 📦 Build for Production

To build the application for production, run:

```bash
npm run build
```

The optimized static files will be generated in the `dist` directory, ready to be deployed to your preferred hosting provider (e.g., Vercel, Netlify, Firebase Hosting).

## 🔒 Security Note
Since BYOK is designed to handle sensitive API keys, please ensure that your environment variables are configured securely and that you never commit your `.env` file to version control. Keys are stored locally on the client to ensure your privacy.

## 📄 License
MIT License
