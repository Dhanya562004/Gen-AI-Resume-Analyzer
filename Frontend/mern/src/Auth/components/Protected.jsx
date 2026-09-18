import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
const Protected = ({children}) => {
    const {User,loading} = useAuth()
    
    if(loading){
        return (<div>Loading.........</div>)
    }
    if(!User){
   return <Navigate to="/login"/>
    }
  return children
}

export default Protected