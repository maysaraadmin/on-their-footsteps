import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Import global styles
import './styles/main.css'

// Get the root element
const container = document.getElementById('root')
const root = createRoot(container)

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
