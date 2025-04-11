'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSocket } from "./SocketProvider";
import { signIn } from "next-auth/react";
import { getCookie } from 'cookies-next/client';
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { z } from 'zod';
import Link from "next/link";

// Schemas
const formSchema = z.object({
  username: z
    .string()
    .min(5, "Username must contain at least 5 characters")
    .max(50, "Username must contain at most 50 characters"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(20, "Password must contain at most 20 characters"),
});

type FormFields = z.infer<typeof formSchema>;

const formSchemaRegister = z
  .object({
    username: z
      .string()
      .min(5, "Username must contain at least 5 characters")
      .max(50, "Username must contain at most 50 characters"),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(20, "Password must contain at most 20 characters"),
    confirmPassword: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

type FormFieldsRegister = z.infer<typeof formSchemaRegister>;

// Component
export default function HomeComponent() {
  const router = useRouter();
  const { socketInstance: socket } = useSocket();
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const formRegister = useForm<FormFieldsRegister>({
    resolver: zodResolver(formSchemaRegister),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmitRegister = async (data: FormFieldsRegister) => {
    const params = {
      username: data.username,
      password: data.password,
    };

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/register`, params);
      console.log('res', res)
      if (res.data.status === 'error') {
        alert('Failed to sign up');
      } else {
        formRegister.reset();
        alert('Successfully registered!');
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Registration error", err);
      alert("Registration failed");
    }
  };

  const handleJoin = async (data: FormFields) => {
    const loginRes = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (loginRes?.ok) {
      const id = getCookie('id');
      const userData = {
        socketID: socket?.id,
        username: data.username,
        id,
      };
      // socket?.emit("register-user", userData);
      router.push(`/mainPage`);
    } else {
      alert("Login failed");
      console.log("Login error:", loginRes?.error);
    }
  };

  return (
    <>
      {isLogin ? (
        <Card className="bg-gray-200 w-[500px] h-[350px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center flex-col">
              <span className='mt-5 md:mt-0'>Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset disabled={form.formState.isSubmitting}>
              <Form {...form}>
                <form
                  className="flex flex-col space-y-4"
                  onSubmit={form.handleSubmit(handleJoin)}
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w- md:w-[25%]">
                    Login
                  </Button>
                </form>
              </Form>
            </fieldset>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-muted-foreground text-sm flex">
              Don't have an account?{" "}
              <div onClick={() => setIsLogin(false)} className="ml-1 underline cursor-pointer">
                Register
              </div>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card className="bg-gray-200 w-[500px] h-auto flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <span className="mt-2">Sign up</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...formRegister}>
              <form
                className="flex flex-col gap-4"
                onSubmit={formRegister.handleSubmit(handleSubmitRegister)}
              >
                <fieldset disabled={formRegister.formState.isSubmitting}>
                  <FormField
                    control={formRegister.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formRegister.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="confirmPassword"
                    control={formRegister.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button className="w-[25%]" type="submit">Register</Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-muted-foreground text-sm flex">
              Already have an account?{" "}
              <div onClick={() => setIsLogin(true)} className="ml-1 underline cursor-pointer">
                Login
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}