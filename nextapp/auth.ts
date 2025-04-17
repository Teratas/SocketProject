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
          password : credentials.password
        }
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/login`, loginData)
        console.log("resData", res.data)
        const userData = res?.data
        const cookieStorage = await cookies()
        cookieStorage.set('id', userData._id)
        cookieStorage.set('username', credentials.username as string)
        cookieStorage.set('token', userData.token)
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