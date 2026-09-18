import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './Auth/pages/Login'
import SignUp from './Auth/pages/SignUp'
import Protected from './Auth/components/Protected'
import Home from './interview/pages/Home'
import Interview from './interview/pages/Interview'
import AllReports from './interview/pages/AllReports'

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Protected><Home/></Protected>} path="/" />
          <Route element={<Login/>} path='/login' />
          <Route element={<SignUp/>} path='/signup' />
          <Route element={<Protected><Interview/></Protected>} path="/interview/:interview" />
          <Route element={<Protected><AllReports/></Protected>} path="/reports" />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  )
}

export default App