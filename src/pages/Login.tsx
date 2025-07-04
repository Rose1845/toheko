import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";
import { AuthenticationResponse } from "@/types/api";

// Define a custom interface for our JWT payload
interface TohekoJwtPayload {
  sub: string;
  role: string;
  [key: string]: any; // Allow for other properties that might be in the token
}

const loginSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for session expiration query parameter and show message
  useEffect(() => {
    const sessionExpired = searchParams.get("sessionExpired");
    if (sessionExpired === "true") {
      toast.error("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear the error for this field when user types
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
      });
      
      // Store the token in localStorage for authenticated requests
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      
      toast.success("Login successful!");
      
      // Check user role from JWT token and redirect accordingly
      if (response.access_token) {
        try {
          // Decode the JWT token to extract user information
          const decodedToken = jwtDecode<TohekoJwtPayload>(response.access_token);
          console.log('Decoded JWT Token:', decodedToken);
          
          // Extract role from the token
          const userRole = decodedToken.role || '';
          console.log('User role from JWT:', userRole);
          
          // Check if the role contains 'member'
          const isMember = userRole.toLowerCase().includes('member');
          
          if (isMember) {
            // Redirect to user dashboard if the user is a member
            navigate("/user/dashboard");
          } else {
            // Redirect to admin dashboard for other roles
            navigate("/admin/dashboard");
          }
        } catch (jwtError) {
          console.error('Error decoding JWT token:', jwtError);
          // Fallback to using the response roles if JWT decoding fails
          const userRoles = response.roles || [];
          console.log('Fallback - User roles from response:', userRoles);
          
          const isMember = userRoles.some(role => role.toLowerCase().includes('member'));
          
          if (isMember) {
            navigate("/user/dashboard");
          } else {
            navigate("/admin/dashboard");
          }
        }
      } else {
        // If no access_token in response, use the roles array as fallback
        const userRoles = response.roles || [];
        console.log('No access_token - Using roles from response:', userRoles);
        
        const isMember = userRoles.some(role => role.toLowerCase().includes('member'));
        
        if (isMember) {
          navigate("/user/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sacco-500 to-success-500 flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
        </div>
        <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            return to homepage
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Email address</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;