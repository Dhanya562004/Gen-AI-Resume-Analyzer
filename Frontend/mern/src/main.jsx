import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.scss'
import { AuthProvider } from './Auth/services/auth.context'
import InterviewProvider from './interview/interview.context.jsx'
import FirebaseProvider from './Firebase/FirebaseProvider.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FirebaseProvider>
<AuthProvider>
      <InterviewProvider>
        <App />
      </InterviewProvider>
    </AuthProvider>
    </FirebaseProvider>
    
  </StrictMode>,
)
