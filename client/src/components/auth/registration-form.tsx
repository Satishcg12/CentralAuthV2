import type { APIResponse } from '@/api/api'
import { useRegister } from '@/api/auth/auth.query'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, } from '@tanstack/react-router'
import { GalleryVerticalEnd } from "lucide-react"
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import Logo from '../logo'
import { APP_NAME, APP_VERSION } from '@/utils/config'

// Add this at the top level of your component
type FieldErrors = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  general?: string; // For general errors not tied to a specific field
};

// Define validation schemas for each step
const step1Schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().optional()
})

const step2Schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address")
})

const step3Schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string()
})

// Combine all schemas for final submission
const formSchema = step1Schema.merge(step2Schema).merge(step3Schema)
type FormData = z.infer<typeof formSchema>

interface StepFormProps {
  formData: Partial<FormData>;
  onSubmit: (data: Partial<FormData>) => Promise<void>;
  handleBack: () => void;
  isSubmitting: boolean;
  step: number;
  fieldErrors: FieldErrors;
  clearFieldError: (field: keyof FieldErrors) => void;
}

// Step 0: Personal Information
const Step0Form = ({
  formData,
  onSubmit,
  handleBack,
  isSubmitting,
  fieldErrors,
  clearFieldError
}: StepFormProps) => {
  const form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
    defaultValues: formData
  })

  // Set server errors in the form
  useEffect(() => {
    if (fieldErrors.first_name) {
      form.setError('first_name', { message: fieldErrors.first_name });
    }
    if (fieldErrors.last_name) {
      form.setError('last_name', { message: fieldErrors.last_name });
    }
    if (fieldErrors.phone_number) {
      form.setError('phone_number', { message: fieldErrors.phone_number });
    }
  }, [fieldErrors, form]);

  // Check if there are any errors for the current step's fields
  const hasStepErrors = Boolean(
    fieldErrors.first_name ||
    fieldErrors.last_name ||
    fieldErrors.phone_number
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your first name"
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError('first_name');
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your last name" onChange={(e) => {
                  field.onChange(e);
                  clearFieldError?.('last_name');
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your phone number" onChange={(e) => {
                  field.onChange(e);
                  clearFieldError?.('phone_number');
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled // Disabled on first step
          >
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting || hasStepErrors}>
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Step 1: Account Information
const Step1Form = ({ formData, onSubmit, handleBack, isSubmitting, fieldErrors, clearFieldError }: StepFormProps) => {
  const form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: formData
  })

  // Set server errors in the form
  useEffect(() => {
    if (fieldErrors.username) {
      form.setError('username', { message: fieldErrors.username });
    }
    if (fieldErrors.email) {
      form.setError('email', { message: fieldErrors.email });
    }
  }, [fieldErrors, form]);

  // Check if there are any errors for the current step's fields
  const hasStepErrors = Boolean(
    fieldErrors.username ||
    fieldErrors.email
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your username" onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('username');
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="m@example.com" onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('email');
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting || hasStepErrors}>
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Step 2: Password
const Step2Form = ({ formData, onSubmit, handleBack, isSubmitting, fieldErrors, clearFieldError }: StepFormProps) => {
  const form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    mode: 'onBlur',
    defaultValues: formData
  })

  // Set server errors in the form
  useEffect(() => {
    if (fieldErrors.password) {
      form.setError('password', { message: fieldErrors.password });
    }
    if (fieldErrors.confirm_password) {
      form.setError('confirm_password', { message: fieldErrors.confirm_password });
    }
  }, [fieldErrors, form]);

  // Check if there are any errors for the current step's fields
  const hasStepErrors = Boolean(
    fieldErrors.password ||
    fieldErrors.confirm_password
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder="********" onChange={(e) => {
                  field.onChange(e);
                  clearFieldError?.('password');
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem className="grid gap-3">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder="********" onChange={(e) => {
                  field.onChange(e);
                  clearFieldError?.('confirm_password');
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting || hasStepErrors}>
            Register
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Update the MultiStageRegistrationForm component
export const MultiStageRegistrationForm = () => {
  const [step, setStep] = useState(0)
  const totalSteps = 3
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Replace the simple error state with a structured object
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const navigate = useNavigate()

  const { mutateAsync } = useRegister();

  // Clear specific field errors when navigating to a different step
  const clearErrorsForStep = (stepNumber: number) => {
    const fieldsToKeep: Record<number, (keyof FieldErrors)[]> = {
      0: ['first_name', 'last_name', 'phone_number'],
      1: ['username', 'email'],
      2: ['password', 'confirm_password'],
    };

    // Only keep errors relevant to the current step
    const newErrors: FieldErrors = {};
    fieldsToKeep[stepNumber]?.forEach(field => {
      if (fieldErrors[field]) {
        newErrors[field] = fieldErrors[field];
      }
    });

    // Always keep general errors
    if (fieldErrors.general) {
      newErrors.general = fieldErrors.general;
    }

    setFieldErrors(newErrors);
  };

  // Clear a specific field error when user edits that field
  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (data: Partial<FormData>) => {
    setIsSubmitting(true)
    try {
      // Clear any existing errors before submission
      setFieldErrors({});

      // Merge form data and update state
      const updatedData = { ...formData, ...data }
      setFormData(updatedData)

      // Proceed to next step or submit
      if (step < totalSteps - 1) {
        setStep(prev => {
          const newStep = prev + 1;
          clearErrorsForStep(newStep);
          return newStep;
        });
      } else {
        if (!updatedData.confirm_password || !updatedData.email || !updatedData.first_name ||
          !updatedData.last_name || !updatedData.username || !updatedData.password) {
          throw new Error("Missing required fields");
        }

        // Call your registration API here
        await mutateAsync({
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          phone_number: updatedData.phone_number,
          username: updatedData.username,
          email: updatedData.email,
          password: updatedData.password,
          confirm_password: updatedData.confirm_password
        });

        toast.success("Registration successful!", {
          description: "You can now log in to your account."

        })

        navigate({ to: "/login" })
      }
    } catch (error) {
      const err = error as APIResponse<null>
      console.error("Registration error:", err)

      if ('error' in err && 'message' in err) {
        // Handle field-specific errors
        if (err.error?.code === 'validation_failed') {
          // If API returns field-specific errors in the details object
          setFieldErrors(prev => ({ ...prev, ...err.error?.details }));

          // Navigate to the appropriate step based on the field with error
          const errorFields = Object.keys(err.error?.details ?? {}) as Array<keyof FieldErrors>;
          if (errorFields.some(field => ['username', 'email'].includes(field as string))) {
            setStep(1); // Account details step
          } else if (errorFields.some(field => ['password', 'confirm_password'].includes(field as string))) {
            setStep(2); // Password step
          } else if (errorFields.some(field => ['first_name', 'last_name', 'phone_number'].includes(field as string))) {
            setStep(0); // Personal info step
          }
        }
        // Handle specific error codes
        else if (err.error?.code === 'duplicate_entry') {
          if (err.error.description?.includes("email")) {
            setFieldErrors(prev => ({ ...prev, email: "This email is already registered" }));
            setFormData(prev => ({ ...prev, email: "" }));
            setStep(1);
          } else if (err.error.description?.includes("username")) {
            setFieldErrors(prev => ({ ...prev, username: "This username is already taken" }));
            setFormData(prev => ({ ...prev, username: "" }));
            setStep(1);
          } else {
            // Generic duplicate error
            setFieldErrors(prev => ({ ...prev, general: err.error?.description || "Duplicate entry detected" }));
          }
        }
        // General error message
        else if (err.message) {
          setFieldErrors(prev => ({ ...prev, general: err.message }));
          toast.error(err.message);
        } else {
          setFieldErrors(prev => ({ ...prev, general: "An error occurred. Please try again." }));
          toast.error("An error occurred. Please try again.");
        }
      } else if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: FieldErrors = {};
        error.errors.forEach(err => {
          if (err.path) {
            const field = err.path[0] as keyof FieldErrors;
            newErrors[field] = err.message;
          }
        });
        setFieldErrors(newErrors);
        toast.error("Validation failed. Please check your inputs.");
      } else {
        // Generic error
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        setFieldErrors(prev => ({ ...prev, general: errorMessage }));
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => {
        const newStep = prev - 1;
        clearErrorsForStep(newStep);
        return newStep;
      });
    }
  }

  // Modified JSX to display general errors
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <Link
          to="/"
          className="flex flex-col items-center gap-2 font-medium"
        >
          <div className="flex size-8 items-center justify-center rounded-md">
            <Logo />
          </div>
          <span className="sr-only">{APP_NAME}.</span>
          <span className="text-sm text-gray-500">{APP_VERSION}</span>
        </Link>
        <h1 className="text-xl font-bold">Create Your Account</h1>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === step ? "w-6 bg-primary" :
                index < step ? "bg-primary" : "bg-muted"
            )} />
          </div>
        ))}
      </div>


      {/* Error Message */}
      {fieldErrors.general && (
        <div className="border border-destructive/50 bg-destructive/10 text-destructive p-3 rounded">
          {fieldErrors.general}
        </div>
      )}

      {/* Render Current Step */}
      {step === 0 && (
        <Step0Form
          formData={formData}
          onSubmit={handleSubmit}
          handleBack={handleBack}
          isSubmitting={isSubmitting}
          step={step}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      )}
      {step === 1 && (
        <Step1Form
          formData={formData}
          onSubmit={handleSubmit}
          handleBack={handleBack}
          isSubmitting={isSubmitting}
          step={step}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      )}
      {step === 2 && (
        <Step2Form
          formData={formData}
          onSubmit={handleSubmit}
          handleBack={handleBack}
          isSubmitting={isSubmitting}
          step={step}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
        />
      )}

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}