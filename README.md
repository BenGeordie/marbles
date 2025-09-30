# Marbles - Collaborative Marble Tracking System

A fun collaborative marble tracking system where users can request marbles through GitHub pull requests. Each user gets their own jar with physics-based marble animations!

## Features

- 🫙 **Individual Jars**: Each user gets their own marble jar
- 🎯 **Git Integration**: Marble requests create GitHub pull requests
- 🎨 **Physics Animation**: Realistic marble dropping with collision physics
- 🔄 **Real-time Sync**: Automatic refresh every 5 minutes
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎉 **Smart Notifications**: Get notified when you receive new marbles

## Prerequisites

Before running this application, you need:

### 1. Node.js
Install Node.js (version 14 or higher) from [nodejs.org](https://nodejs.org/)

### 2. GitHub CLI (Required)
The marble request system uses GitHub CLI to create pull requests automatically.

**Installation:**
- **macOS**: `brew install gh`
- **Windows**: `winget install --id GitHub.cli` or download from [GitHub CLI releases](https://github.com/cli/cli/releases)
- **Linux**: Follow instructions at [GitHub CLI installation guide](https://github.com/cli/cli/blob/trunk/docs/install_linux.md)

**Authentication:**
After installation, authenticate with GitHub:
```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### 3. Git Repository
This application must be run in a Git repository that:
- Has a remote origin (GitHub repository)
- You have push access to
- Contains the `marble_ownership.json` file

## Installation

1. **Clone or navigate to your repository:**
```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

2. **Install dependencies:**
```bash
npm install
```

## Running the Application

1. **Start the server:**
```bash
npm start
```

2. **Open your browser:**
Navigate to `http://localhost:3000`

3. **Start tracking marbles!**
- Click "Add Marble" to request a marble through a GitHub PR
- Watch as new marbles drop into jars with physics animation
- See real-time updates as other users request marbles

## How It Works

### Marble Request Flow
1. User clicks "Add Marble"
2. System creates a new Git branch (`marble-request-{username}-{timestamp}`)
3. Updates `marble_ownership.json` with incremented count
4. Commits and pushes the branch
5. **Creates a GitHub Pull Request automatically**
6. Returns to main branch
7. Other users can merge the PR to approve the marble

### File Structure
```
├── server.js              # Backend server with Git operations
├── index.html             # Frontend HTML
├── script.js              # Client-side JavaScript with physics
├── style.css              # Styling and animations
├── package.json           # Dependencies
├── marble_ownership.json  # Marble count data (auto-generated)
└── README.md             # This file
```

### API Endpoints
- `GET /api/refresh` - Pull from repo and sync marble data
- `POST /api/request-marble` - Create branch, commit, push, and make PR
- `GET /api/marbles` - Get current marble ownership data

## Troubleshooting

### "gh: command not found"
Install GitHub CLI following the instructions above.

### "gh: not authenticated"
Run `gh auth login` and follow the authentication flow.

### "Permission denied" on Git operations
Ensure you have push access to the repository and your Git credentials are configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Port 3000 already in use
Change the port by setting the PORT environment variable:
```bash
PORT=3001 npm start
```

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

This requires `nodemon` which is included in the dev dependencies.

## Contributing

1. Request a marble through the app
2. Review and merge pull requests from other users
3. Watch your marble collection grow!

The `marble_ownership.json` file tracks everyone's marble count and gets updated through the GitHub PR workflow.

## Tips

- **Patience**: After clicking "Add Marble", wait for others to merge your PR
- **Be Social**: Merge other people's marble requests to keep the system flowing
- **Watch Animations**: New marbles drop with realistic physics when counts update
- **Stay Synced**: The system auto-refreshes every 5 minutes to show new marbles

Have fun collecting marbles! 🎯