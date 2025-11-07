# 🎂 PhotoPileMemory

An interactive, playful birthday celebration web application that combines photo galleries, birthday wishes, time-capsule messages, and fun visual effects to create a memorable birthday experience!

## ✨ Features

### 🖼️ Interactive Photo Gallery
- **Draggable Photos**: Move and arrange photos anywhere on the screen
- **Photo Upload**: Add your own photos with custom comments
- **Slideshow Mode**: Auto-advance through photos with transitions
- **Visual Effects**: Deep-fry, glitch, shake, spin, and confetti effects
- **Random Photo Picker**: Randomly highlight and zoom into photos

### 💌 Birthday Wishes System
- **Sticky Notes**: Birthday wishes displayed as colorful sticky notes
- **Multiple Styles**: Choose from Comic, Impact, Retro, or Rainbow Gel Pen styles
- **Custom Positioning**: Notes appear at random positions with rotation
- **Anonymous Support**: Default name "anoni hea koi" for anonymous wishes

### ⏰ Time Capsule Messages
- **Hour-Based Messages**: Different messages appear based on the current hour
- **Custom Messages**: Users can submit messages for specific hours
- **Real-Time Clock**: Live clock display showing current time
- **Sarcastic Defaults**: Pre-loaded humorous age-related messages

### 🎭 Fun Features & Easter Eggs
- **Age Verification Screen**: Dramatic "horror-themed" entrance with countdown and effects
- **Confetti Animation**: Celebratory confetti across the screen
- **Konami Code**: Enter ↑↑↓↓←→←→BA for a rainbow surprise
- **Theme Modes**: Vaporwave, Matrix, 90s Web, and Normal themes
- **Graph Paper Aesthetic**: Consistent retro-inspired design throughout

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** - Lightning-fast build tool
- **Wouter** - Lightweight routing
- **TanStack React Query** - Server state management
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **React Hook Form + Zod** - Form validation

### Backend
- **Node.js** with Express 4.21.2
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Type-safe database operations
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **WebSocket** support for real-time features

## 📦 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL database (automatically provided on Replit)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PhotoPileMemory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/photopilememory
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes to your database

## 🗄️ Database Schema

The application uses PostgreSQL with the following tables:

### `users`
- User authentication (planned feature)
- Fields: id, username, password

### `wishes`
- Birthday wishes/notes
- Fields: id, text, name, style, position, rotation, fontSize, shape, createdAt

### `time_capsule_messages`
- Hour-based time capsule messages
- Fields: id, hour, message

### `user_photos`
- User-uploaded photos
- Fields: id, src (base64), x, y, rotation, zIndex, comment, createdAt

## 🌐 Deployment

### Deploying to Replit (Recommended)

This application is optimized for Replit deployment:

1. **Import to Replit**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Paste your repository URL

2. **Configure Replit**
   - The `.replit` file is already configured
   - Replit will automatically:
     - Install dependencies
     - Set up PostgreSQL (via postgresql-16 module)
     - Provide `DATABASE_URL` environment variable

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Run the application**
   - Click the "Run" button in Replit
   - Your app will be live at your Replit URL

### Deploying to Other Platforms

For Vercel, Netlify, or other platforms:

1. Ensure you have a PostgreSQL database (Neon, Supabase, etc.)
2. Set the `DATABASE_URL` environment variable
3. Run the build command: `npm run build`
4. Start the server: `npm run start`

## 🎨 Customization

### Adding Your Own Photos
1. Place images in `client/public/` directory
2. Update `client/src/lib/constants.ts`:
   ```typescript
   export const PHOTOS: string[] = [
     "/your-image-1.jpg",
     "/your-image-2.jpg",
     // ... add more
   ];
   ```

### Customizing Time Capsule Messages
Edit `DEFAULT_TIME_CAPSULE_MESSAGES` in `client/src/lib/constants.ts`:
```typescript
export const DEFAULT_TIME_CAPSULE_MESSAGES = [
  { hour: 8, message: "Your morning message" },
  { hour: 12, message: "Your noon message" },
  // ... customize for each hour
];
```

### Changing Themes
The app uses a graph-paper aesthetic. Modify `tailwind.config.ts` to customize:
- Colors
- Fonts
- Background patterns

## 🐛 Troubleshooting

### Database Connection Issues
- **Local**: Ensure PostgreSQL is running and `DATABASE_URL` is correct
- **Replit**: Ensure the `postgresql-16` module is added in `.replit`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
The app runs on port 5000 by default. Change in `server/index.ts` if needed.

## 📝 Project Structure

```
PhotoPileMemory/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and constants
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets (images)
│   └── index.html         # HTML template
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── vite.ts           # Vite dev server setup
├── shared/               # Shared code between client/server
│   └── schema.ts         # Database schema (Drizzle)
├── attached_assets/      # Original assets
├── migrations/           # Database migrations (auto-generated)
├── .replit              # Replit configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── drizzle.config.ts    # Drizzle ORM configuration
└── package.json         # Dependencies and scripts
```

## 🎯 API Endpoints

### Wishes
- `GET /api/wishes` - Fetch all birthday wishes
- `POST /api/wishes` - Create a new wish

### Photos
- `GET /api/user-photos` - Fetch all user-uploaded photos
- `POST /api/user-photos` - Upload a new photo

### Time Capsule
- `GET /api/time-capsule-messages` - Fetch all time capsule messages
- `POST /api/time-capsule-messages` - Create a new message
- `GET /api/time-capsule-messages/current` - Get message for current hour

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Credits

Built with ❤️ for creating memorable birthday experiences!

---

**Enjoy creating unforgettable birthday celebrations!** 🎂🎈🎊
