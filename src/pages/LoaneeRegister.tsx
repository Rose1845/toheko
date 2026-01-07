import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import apiClient from "@/services/api";

const LoaneeRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userFirstname: "",
    userLastname: "",
    userEmail: "",
    userPassword: "",
    confirmPassword: "",
    userPhoneNumber: "",
    userIdNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userFirstname.trim()) {
      newErrors.userFirstname = "First name is required";
    }

    if (!formData.userLastname.trim()) {
      newErrors.userLastname = "Last name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "Email is required";
    } else if (!emailRegex.test(formData.userEmail)) {
      newErrors.userEmail = "Invalid email format";
    }

    if (!formData.userPassword) {
      newErrors.userPassword = "Password is required";
    } else if (formData.userPassword.length < 6) {
      newErrors.userPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.userPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.userPhoneNumber.trim()) {
      newErrors.userPhoneNumber = "Phone number is required";
    }

    if (!formData.userIdNumber.trim()) {
      newErrors.userIdNumber = "ID number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await apiClient.post("/api/v1/auth/register-loanees", registrationData);

      if (response.data.otp_required) {
        toast.success(response.data.message);
        navigate("/verify-otp", { 
          state: { 
            email: formData.userEmail, 
            userType: "loanee",
            password: formData.userPassword // Pass password for auto-login after OTP
          } 
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Loanee Registration</CardTitle>
          <CardDescription>Create your loanee account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userFirstname">First Name</Label>
                <Input
                  id="userFirstname"
                  name="userFirstname"
                  value={formData.userFirstname}
                  onChange={handleChange}
                  placeholder="John"
                  className={errors.userFirstname ? "border-red-500" : ""}
                />
                {errors.userFirstname && (
                  <p className="text-sm text-red-500">{errors.userFirstname}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userLastname">Last Name</Label>
                <Input
                  id="userLastname"
                  name="userLastname"
                  value={formData.userLastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={errors.userLastname ? "border-red-500" : ""}
                />
                {errors.userLastname && (
                  <p className="text-sm text-red-500">{errors.userLastname}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className={errors.userEmail ? "border-red-500" : ""}
              />
              {errors.userEmail && (
                <p className="text-sm text-red-500">{errors.userEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPhoneNumber">Phone Number</Label>
              <Input
                id="userPhoneNumber"
                name="userPhoneNumber"
                value={formData.userPhoneNumber}
                onChange={handleChange}
                placeholder="+254712345678"
                className={errors.userPhoneNumber ? "border-red-500" : ""}
              />
              {errors.userPhoneNumber && (
                <p className="text-sm text-red-500">{errors.userPhoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userIdNumber">ID Number</Label>
              <Input
                id="userIdNumber"
                name="userIdNumber"
                value={formData.userIdNumber}
                onChange={handleChange}
                placeholder="12345678"
                className={errors.userIdNumber ? "border-red-500" : ""}
              />
              {errors.userIdNumber && (
                <p className="text-sm text-red-500">{errors.userIdNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword">Password</Label>
              <Input
                id="userPassword"
                name="userPassword"
                type="password"
                value={formData.userPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.userPassword ? "border-red-500" : ""}
              />
              {errors.userPassword && (
                <p className="text-sm text-red-500">{errors.userPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoaneeRegister;
