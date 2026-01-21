# HotSeat - Mobile Party Game

HotSeat is a mobile party game where a group of people uses a single device to play structured conversation rounds. One player is put in the "hot seat", given a prompt, and answers out loud while others listen and rate their response. The app tracks scores and shows an MVP at the end!

## Features

- **5 Categories**: Friends, Date, Family, Deep, Funny
- **2-8 Players**: Pass the phone around for a shared experience
- **Score System**: Rate answers as Amazing (3pts), Good (2pts), or Ok (1pt)
- **MVP Tracking**: See who the best talker is at the end
- **Game History**: Review past games and their results

## Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- Expo Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- RESTful API architecture

## Project Structure

```
hotseat/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home screen
│   ├── setup.tsx          # Game setup screen
│   ├── game/
│   │   ├── round.tsx      # Active round screen
│   │   └── scoreboard.tsx # Final scores screen
│   └── history/
│       ├── index.tsx      # Past games list
│       └── [id].tsx       # Game details
├── backend/               # Node.js backend
│   └── src/
│       ├── models/        # MongoDB schemas
│       ├── controllers/   # Request handlers
│       ├── routes/        # API routes
│       ├── seeds/         # Database seed data
│       └── index.js       # Server entry point
├── context/               # React Context providers
├── services/              # API service layer
├── types/                 # TypeScript type definitions
└── constants/             # Theme and constants
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas account)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your device

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB connection string if needed:
   ```
   MONGODB_URI=mongodb://localhost:27017/hotseat
   PORT=3001
   ```

5. Make sure MongoDB is running, then seed the database:
   ```bash
   npm run seed
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3001`

### Frontend Setup

1. From the project root, install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the API URL in `.env` if needed:
   - For iOS Simulator: `http://localhost:3001/api` (default)
   - For Android Emulator: `http://10.0.2.2:3001/api`
   - For Physical Device: Use your computer's local IP (e.g., `http://192.168.1.100:3001/api`)

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Questions
- `GET /api/questions/categories` - Get all categories with question counts
- `GET /api/questions/:category` - Get questions by category
- `GET /api/questions/:category/random` - Get a random question

### Games
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get game by ID
- `GET /api/games/:id/next-round` - Get next round data
- `POST /api/games/:id/submit-round` - Submit round result
- `GET /api/games/history` - Get completed games history
- `GET /api/games/:id/details` - Get full game details with rounds

## Game Flow

1. **Home Screen**: Start a new game or view past games
2. **Setup Screen**:
   - Select a category (Friends/Date/Family/Deep/Funny)
   - Choose number of rounds (5 or 10)
   - Add 2-8 player names
3. **Round Screen**:
   - See who's in the hot seat
   - Read the question aloud
   - After the player answers, rate their response
4. **Scoreboard**: View final scores and the MVP

## Development Notes

### Running Both Frontend and Backend

For local development, you'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm start
```

### Testing on Physical Devices

1. Make sure your phone and computer are on the same network
2. Find your computer's local IP address
3. Update the `EXPO_PUBLIC_API_URL` in `.env` with your IP
4. Restart the Expo development server

### Database Management

To reset the database with fresh questions:
```bash
cd backend
npm run seed
```

## Troubleshooting

### "Network Error" when starting a game
- Make sure the backend server is running
- Check that the API URL in `.env` is correct for your environment
- For Android emulator, use `http://10.0.2.2:3001/api`

### Questions not loading
- Run `npm run seed` in the backend directory to populate questions
- Check MongoDB connection in backend logs

### App not connecting to backend on physical device
- Use your computer's local IP instead of localhost
- Ensure both devices are on the same network
- Check firewall settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
