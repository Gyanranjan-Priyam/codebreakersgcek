"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import statesDistrictsData from "@/lib/new/states-districts.json";
import { formSchema } from "@/lib/zodSchema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type FormValues = z.infer<typeof formSchema>;

interface OnboardingFormProps {
  userEmail: string;
  userName: string;
}

export default function OnboardingForm({ userEmail, userName }: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    available: boolean | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    suggestions: [],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      firstName: userName ? userName.split(" ")[0] : "",
      middleName: "",
      lastName: userName ? userName.split(" ").slice(1).join(" ") : "",
      email: userEmail || "",
      phone: "",
      whatsappNumber: "",
      registration: "",
      rollNumber: "",
      branch: "",
      admissionYear: "",
      collegeName: "",
      collegeAddress: "",
      address: "",
      postOffice: "",
      policeStation: "",
      block: "",
      pinCode: "",
      state: "",
      district: "",
    },
  });

  const [selectedState, setSelectedState] = useState("");
  
  // Watch username and name fields for suggestions
  const username = form.watch("username");
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");

  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    const stateData = statesDistrictsData.states.find(
      (s) => s.state === selectedState
    );
    return stateData?.districts || [];
  }, [selectedState]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    form.setValue("state", value);
    form.setValue("district", "");
  };

  const handleCollegeChange = (value: string) => {
    setSelectedCollege(value);
    form.setValue("collegeName", value);
    
    // Auto-fill address if GCEK is selected
    if (value === "GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA") {
      form.setValue("collegeAddress", "AT-KANDHABANDO PALA, PO- RISIGAON, BHWANIPATNA, KALAHANDI, ODISHA, 766003");
    } else {
      form.setValue("collegeAddress", "");
    }
  };

  // Generate admission years from 2023 to current year + 1
  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: currentYear - 2022 + 2 }, (_, i) => 2023 + i);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 2) {
      setUsernameCheck({ checking: false, available: null, suggestions: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameCheck({ checking: true, available: null, suggestions: [] });
      
      try {
        const response = await fetch("/api/user/check-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            firstName,
            lastName,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setUsernameCheck({
            checking: false,
            available: data.available,
            suggestions: data.suggestions || [],
          });
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameCheck({ checking: false, available: null, suggestions: [] });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, firstName, lastName]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to complete profile');
        return;
      }

      toast.success('Profile completed successfully! Redirecting...');
      
      // Redirect to dashboard after successful profile completion
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Welcome to CodeBreakers An official coding club of GCEK Bhawanipatna. To get started, please complete your profile with the details below. 
            This information will be used for all your future reference.
          </CardDescription>
        </CardHeader>
        <Separator/>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Personal Information
                  </h3>
                  <Separator />
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Enter your username" 
                            {...field} 
                            disabled={isSubmitting}
                            className={
                              usernameCheck.available === true
                                ? "border-green-500"
                                : usernameCheck.available === false
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {usernameCheck.checking && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {!usernameCheck.checking && usernameCheck.available === true && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                          )}
                          {!usernameCheck.checking && usernameCheck.available === false && (
                            <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </FormControl>
                      {usernameCheck.available === false && (
                        <div className="mt-2 text-sm text-red-500">
                          Username is already taken
                        </div>
                      )}
                      {usernameCheck.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Available suggestions:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {usernameCheck.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  form.setValue("username", suggestion);
                                }}
                                className="px-3 py-1 text-xs bg-primary hover:bg-primary/80 rounded-md transition-colors cursor-pointer"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your middle name"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your WhatsApp phone number"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Academic Information
                  </h3>
                  <Separator />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="admissionYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select admission year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {admissionYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your registration number"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your roll number"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="EE">EE</SelectItem>
                          <SelectItem value="ME">ME</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="collegeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Name</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value !== "Other") {
                            field.onChange(value);
                          }
                          handleCollegeChange(value);
                        }}
                        value={selectedCollege === "Other" ? "Other" : field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA">
                            GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedCollege === "Other" && (
                        <Input
                          placeholder="Enter your college name"
                          value={field.value === "Other" ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={isSubmitting}
                          className="mt-2"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collegeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="College address"
                          {...field}
                          disabled={isSubmitting || selectedCollege === "GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA"}
                          className={selectedCollege === "GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA" ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    Address Information
                  </h3>
                  <Separator />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your address"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postOffice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Office</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your post office"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="policeStation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Police Station</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your police station"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="block"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your block"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pin Code</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your pin code"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleStateChange(value);
                          }}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statesDistrictsData.states.map((stateItem) => (
                              <SelectItem
                                key={stateItem.state}
                                value={stateItem.state}
                              >
                                {stateItem.state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedState || isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDistricts.map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" size="lg" className="cursor-pointer w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Completing Profile...
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
