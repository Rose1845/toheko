import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";

const registerSchema = z
  .object({
    userFirstname: z
      .string()
      .min(2, "First name must be at least 2 characters"),
    userLastname: z.string().min(2, "Last name must be at least 2 characters"),
    userIdNumber: z
      .string()
      .max(9, "ID NO not more than 9 characters")
      .min(8, "ID NO must be at least 8 characters"),

    userEmail: z.string().email("Please enter a valid userEmail address"),
    userPhoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 characters"),
    userPassword: z
      .string()
      .min(6, "userPassword must be at least 6 characters"),
    confirmuserPassword: z
      .string()
      .min(6, "Confirm userPassword must be at least 6 characters"),
  })
  .refine((data) => data.userPassword === data.confirmuserPassword, {
    message: "userPasswords don't match",
    path: ["confirmuserPassword"],
  });

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userFirstname: "",
    userLastname: "",
    userEmail: "",
    userPhoneNumber: "",
    userUsername: "",
    userPassword: "",
    userIdNumber: "",
    confirmuserPassword: "",
    roleId: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      registerSchema.parse(formData);
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
      const registerData = {
        userFirstname: formData.userFirstname,
        userLastname: formData.userLastname,
        userEmail: formData.userEmail,
        userPhoneNumber: formData.userPhoneNumber,
        userUsername: formData.userUsername,
        userIdNumber: formData.userIdNumber,
        userPassword: formData.userPassword,
        roleId: 1,
      };

      await authService.register(registerData);
      toast.success("Registration successful! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
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
          Create your account
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
            <CardTitle className="text-center">Register</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userFirstname">First name</Label>
                  <Input
                    id="userFirstname"
                    placeholder="First name"
                    value={formData.userFirstname}
                    onChange={handleInputChange}
                    required
                    className={errors.userFirstname ? "border-red-500" : ""}
                  />
                  {errors.userFirstname && (
                    <p className="text-sm text-red-500">
                      {errors.userFirstname}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userLastname">Last name</Label>
                  <Input
                    id="userLastname"
                    placeholder="Last name"
                    value={formData.userLastname}
                    onChange={handleInputChange}
                    required
                    className={errors.userLastname ? "border-red-500" : ""}
                  />
                  {errors.userLastname && (
                    <p className="text-sm text-red-500">
                      {errors.userLastname}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email address</Label>
                  <Input
                    id="userEmail"
                    type="userEmail"
                    placeholder="Enter your userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    required
                    className={errors.userEmail ? "border-red-500" : ""}
                  />
                  {errors.userEmail && (
                    <p className="text-sm text-red-500">{errors.userEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userUsername">Username</Label>
                  <Input
                    id="userUsername"
                    type="userUsername"
                    placeholder="Enter your username"
                    value={formData.userUsername}
                    onChange={handleInputChange}
                    required
                    className={errors.userUsername ? "border-red-500" : ""}
                  />
                  {errors.userEmail && (
                    <p className="text-sm text-red-500">
                      {errors.userUsername}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userIdNumber">ID NO</Label>
                  <Input
                    id="userIdNumber"
                    type="text"
                    placeholder="Enter your ID NO"
                    value={formData.userIdNumber}
                    onChange={handleInputChange}
                    required
                    className={errors.userIdNumber ? "border-red-500" : ""}
                  />
                  {errors.userEmail && (
                    <p className="text-sm text-red-500">
                      {errors.userIdNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userPhoneNumber">Phone number</Label>
                  <Input
                    id="userPhoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.userPhoneNumber}
                    onChange={handleInputChange}
                    required
                    className={errors.userPhoneNumber ? "border-red-500" : ""}
                  />
                  {errors.userPhoneNumber && (
                    <p className="text-sm text-red-500">
                      {errors.userPhoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userPassword">userPassword</Label>
                  <Input
                    id="userPassword"
                    type="userPassword"
                    placeholder="Create a userPassword"
                    value={formData.userPassword}
                    onChange={handleInputChange}
                    required
                    className={errors.userPassword ? "border-red-500" : ""}
                  />
                  {errors.userPassword && (
                    <p className="text-sm text-red-500">
                      {errors.userPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmuserPassword">
                    Confirm userPassword
                  </Label>
                  <Input
                    id="confirmuserPassword"
                    type="userPassword"
                    placeholder="Confirm your userPassword"
                    value={formData.confirmuserPassword}
                    onChange={handleInputChange}
                    required
                    className={
                      errors.confirmuserPassword ? "border-red-500" : ""
                    }
                  />
                  {errors.confirmuserPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmuserPassword}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
