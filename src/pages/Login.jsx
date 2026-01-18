import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "../components/ui/checkbox";
import {
  deleteUser,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import Session from "./Session";
import { auth, db } from "@/firebase";
import Loading from "@/components/Loader";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { coursesList } from "@/data/global_config";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(false);
  const [corporateLogin, setCorporateLogin] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const formSchema = z.object({
    orgCode: z.string().min(1, { message: "Organization Code is required" }),
    code: z.string().min(1, { message: "Course Code is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgCode: "",
      code: "",
      email: "",
      password: "",
    },
  });

  const validateCourse = () => {
    let code = form.getValues("code").replace(/\s+/g, "").toLowerCase();
    if (!coursesList[code]) {
      toast({
        variant: "destructive",
        title: `Invalid Course Code!`,
        description: "Please enter a valid course code",
      });
      return false;
    }
    return true;
  };

  const authorizeUser = async (email, code, orgCode) => {
    try {
      const orgDocRef = doc(db, `CorporateClients/${orgCode}`);
      const orgDocSnap = await getDoc(orgDocRef);

      if (!orgDocSnap.exists()) {
        toast({
          variant: "destructive",
          title: "Invalid Organization Code!",
          description: "Please enter a valid org code",
        });
        return false;
      }

      const orgData = orgDocSnap.data();
      const isCourseAvailable = orgData?.EnrolledCourses?.includes(code);

      if (!isCourseAvailable) {
        toast({
          variant: "destructive",
          title: "Course Not Available!",
          description: "This course is not offered by the organization",
        });
        return false;
      }

      const studentInfoRef = collection(db, `CorporateClients/${orgCode}/studentInfo`);
      const querySnapshot = await getDocs(studentInfoRef);

      let authorized = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.email?.toLowerCase() === email.toLowerCase()) {
			authorized = true;
			const studentId = doc.id;
			
			localStorage.setItem("studentId", studentId);
			localStorage.setItem("isAdmin", data?.isAdmin === true);
        }
      });

      if (!authorized) {
        toast({
          variant: "destructive",
          title: "Unauthorized Email!",
          description: "This email is not registered under the organization",
        });
      }

      return authorized;
    } catch (error) {
      console.error("Authorization error:", error);
      toast({
        variant: "destructive",
        title: "Authorization Failed!",
        description: "Something went wrong. Please try again.",
      });
      return false;
    }
  };

  const handleSignIn = async (values) => {
    const { code, email, password, orgCode } = values;
    const validCourse = validateCourse();
    if (validCourse && corporateLogin) {
      try {
        setAuthChecking(true);
        await signInWithEmailAndPassword(auth, email, password);
        const isAuthorized = await authorizeUser(email, code, orgCode);
        if (!isAuthorized) {
          await signOut(auth);
          navigate("/login");
        } else {
          localStorage.setItem("courseCode", code);
          localStorage.setItem("orgCode", orgCode);
		  alert(orgCode);
          navigate("/");
        }
      } catch (error) {
        console.error("Sign-In Error:", error);
        toast({
          variant: "destructive",
          title: "Invalid Credentials!",
          description: "Please enter valid credentials",
        });
        localStorage.removeItem("courseCode");
      } finally {
        setAuthChecking(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const code = form.getValues("code");
    const orgCode = form.getValues("orgCode");
    const validCourse = validateCourse();
    if (validCourse) {
      setAuthChecking(true);
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result) {
          const user = result.user;
          const isAuthorized = await authorizeUser(user.email, code, orgCode);
          if (!isAuthorized) {
            await signOut(auth);
            await deleteUser(user);
            navigate("/login");
          } else {
            localStorage.setItem("courseCode", code);
            localStorage.setItem("orgCode", orgCode);
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        toast({
          variant: "destructive",
          title: `Login Error!`,
          description: "Please try again later",
        });
        localStorage.removeItem("courseCode");
      } finally {
        setAuthChecking(false);
      }
    }
  };

  if (authChecking) {
    return <Loading message={"Authenticating"} />;
  }

  if (user && !authChecking) {
    return <Session />;
  }

  return (
    <div className="flex w-full justify-center items-center h-screen">
      <Card className="w-[320px] md:w-[350px] shadow-lg">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xl">Edu Portal</CardTitle>
          <CardDescription className="text-base">Instructor - Naveen Pn</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)}>
              <div className="grid w-full items-center gap-4">

                {/* Organization Code Field */}
                <FormField
                  control={form.control}
                  name="orgCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your organization code"
                          className="text-base py-3 h-10"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.orgCode?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Course Code Field */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your course code"
                          className="text-base py-3 h-10"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.code?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Corporate Checkbox */}
                <FormLabel className="flex items-center w-full gap-2">
                  <Checkbox
                    id="corporateLogin"
                    checked={corporateLogin}
                    onCheckedChange={setCorporateLogin}
                  />
                  <FormLabel htmlFor="corporateLogin" className="text-base">
                    Corporate Login
                  </FormLabel>
                </FormLabel>

                {/* Google Sign-In */}
                {!corporateLogin && (
                  <Button
                    type="submit"
                    onClick={handleGoogleSignIn}
                    className="mt-1 text-base w-full py-5 m-auto font-medium"
                  >
                    Sign In with Google
                  </Button>
                )}

                {/* Email/Password Login */}
                {corporateLogin && (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email address"
                              className="text-base py-3 h-10"
                            />
                          </FormControl>
                          <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your password"
                              className="text-base py-3 h-10"
                            />
                          </FormControl>
                          <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="text-base w-full py-5 m-auto font-medium">
                      Login with Email
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
