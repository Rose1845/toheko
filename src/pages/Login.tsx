import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface TohekoJwtPayload {
  sub: string;
  role: string;
  [key: string]: any;
}

const loginSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const sessionExpired = searchParams.get("sessionExpired");
    if (sessionExpired === "true") {
      toast.error("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

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
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      
      toast.success("Login successful!");
      
      if (response.access_token) {
        try {
          const decodedToken = jwtDecode<TohekoJwtPayload>(response.access_token);
          console.log('Decoded JWT Token:', decodedToken);
          localStorage.setItem("userId", decodedToken.userId);
          localStorage.setItem("role", decodedToken.role);
          
          const userRole = decodedToken.role || '';
          console.log('User role from JWT:', userRole);
          
          const isMember = userRole.toLowerCase().includes('member');
          
          if (isMember) {
            navigate("/user/dashboard");
          } else {
            navigate("/admin/dashboard");
          }
        } catch (jwtError) {
          console.error('Error decoding JWT token:', jwtError);
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
        const userRoles = response.roles || [];
        console.log('No access_token - Using roles from response:', userRoles);
        
        const isMember = userRoles.some(role => role.toLowerCase().includes('member'));
        
        if (isMember) {
          navigate("/user/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Check if error is about OTP not verified
      const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || "";
      const isOTPError = errorMessage.toLowerCase().includes("otp not verified") || 
                         errorMessage.toLowerCase().includes("otp") && errorMessage.toLowerCase().includes("verify");
      
      if (isOTPError) {
        toast.info("Please verify your OTP first.");
        
        // Redirect to OTP request page where user can enter email
        navigate("/request-otp", { 
          state: { 
            email: formData.username,
            fromLogin: true 
          } 
        });
      } else {
        toast.error("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sacco-500 via-sacco-600 to-sacco-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sacco-500/30">
              M
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to continue to your account
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sacco-500 via-sacco-600 to-sacco-700"></div>
          
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-xl font-bold text-center text-gray-900">
              Sign In
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={`h-10 pl-9 transition-all ${errors.username ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-sacco-600 hover:text-sacco-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`h-10 pl-9 pr-9 transition-all ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center pt-1">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-sacco-600 to-sacco-700 hover:from-sacco-700 hover:to-sacco-800 shadow-lg hover:shadow-xl transition-all group" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 bg-gray-50 border-t py-4">
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-sacco-600 hover:text-sacco-700 hover:underline transition-colors"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;