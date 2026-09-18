import React from 'react'
import { createContext } from 'react'
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth"
import { app } from './firebase'
import { useContext } from 'react'
export const FirebaseContext = createContext()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
export const useFirebase = () =>{
  return useContext(FirebaseContext)
}
const FirebaseProvider = ({children}) => {

  const signupwithgoogle = async () =>{
   try{
    const result = await signInWithPopup(auth,googleProvider)
    return result
   }
   catch(error){
    console.log("Error Ocuured",error)
   }
  }
  return (
    <FirebaseContext.Provider value={{signupwithgoogle}}>
        {children}
    </FirebaseContext.Provider>
  )
}

export default FirebaseProvider