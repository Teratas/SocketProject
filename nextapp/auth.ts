import axios from "axios"
import NextAuth from "next-auth"
import Credentials from 'next-auth/providers/credentials'
import { cookies } from "next/headers"
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials : {
        username : {},
        password : {}
      },
      authorize : async (credentials) => {
        if(!credentials.username || !credentials.password){
          throw new Error('Missing Credentials')
        }
        const loginData = {
          username : credentials.username,
    
        }
        const res = await axios.post('http://localhost:5000/users/login', loginData)
        const userData = res?.data?.findUser
        const cookieStorage = await cookies()
        cookieStorage.set('id', userData._id)
        cookieStorage.set('username', userData.username)
        return userData
      }

    })
  ],
  callbacks : {
    jwt({token, user} : {token : any, user : any}){
      if(user){
        token.username = user.username
        token.id = user._id
        
      }
      return token
    },
    session({session, token} : {token : any, session : any}){
      if(token){
        session.id = token.id
        session.username = token.username
      }
      return session
    }
  }
})