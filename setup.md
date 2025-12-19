# NextCap 2.0 – React Application Setup Guide

This document describes how to **set up, run, and build** the NextCap 2.0 React application using **Visual Studio Code**.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js (v14 or higher)
- Download: https://nodejs.org/
- Verify installation:
```bash
node --version
```

### 2. npm (comes with Node.js)
- Verify installation:
```bash
    npm --version
```

### 3. Visual Studio Code
- Download: https://code.visualstudio.com/

## Step-by-Step Setup Instructions
###Step 1: Create React Project
Open a terminal or command prompt and run:

```bash
# Create a new React app
npx create-react-app nextcap-app

# Navigate into the project folder
cd nextcap-app
```
###Step 2: Install Required Dependencies
```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Lucide React (for icons)
npm install lucide-react
```

###Step 3: Configure Tailwind CSS
Edit tailwind.config.js

```javascript

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
Edit src/index.css (replace all content)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
###Step 4: Create the Component File
1. In VS Code, open the nextcap-app folder
(File → Open Folder)
2. Create a new file: src/ProductionScreen.jsx
3. Copy the React component code (provided below) into this file.

###Step 5: Update App.js
Edit src/App.js:

```javascript
import React from 'react';
import ProductionScreen from './ProductionScreen';

function App() {
  return (
    <div className="App">
      <ProductionScreen />
    </div>
  );
}

export default App;
```
###Step 6: Run the Application
In the VS Code terminal (Terminal → New Terminal), run:

```bash
npm start
```
The application will open automatically in your browser:
http://localhost:3000

##Troubleshooting
###Common Issues
###1. Module not found
```bash
npm install
```

###2. Port 3000 already in use
```bash
#Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```


###3. Tailwind styles not working
Verify content paths in tailwind.config.js

Restart the dev server:
```bash
Ctrl + C
npm start
```

###Project Structure
```csharp
nextcap-app/
├── node_modules/
├── public/
├── src/
│   ├── ProductionScreen.jsx    # Main component
│   ├── App.js                  # Main app file
│   ├── index.js
│   └── index.css               # Tailwind imports
├── package.json
├── tailwind.config.js
└── README.md
```
###Useful VS Code Extensions
1. ES7+ React/Redux/React-Native Snippets – React code snippets
2. Tailwind CSS IntelliSense – Tailwind class autocomplete
3. Prettier – Code formatter
4. ESLint – Code linting

###Development Tips
- Hot Reload: Browser refreshes automatically on save
- Browser Console: Press F12 to view logs
- Stop Server: Press Ctrl + C in terminal
- Clear Cache: Delete
```bash
rm -rf node_modules
npm install
```
##Build for Production
When ready to deploy:
```bash
npm run build
```
This creates an optimized production build in the build/ directory.






