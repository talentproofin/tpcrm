"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { AUTH_MESSAGES } from "../constants/messages";
import { AUTH_ROUTES } from "../constants/routes";
import { authService } from "../services/authService";
import { getAuthErrorMessage, mapAuthErrorCode } from "../utils/authErrors";
import { loginDefaultValues, loginSchema } from "../validation/loginSchema";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values) {
    setFormError(null);

    const { data: result, error } = await authService.signIn(values);

    if (error) {
      setFormError(getAuthErrorMessage(mapAuthErrorCode(error)));
      return;
    }

    if (result?.accessDenied && result.accessReason) {
      const params = new URLSearchParams({ reason: result.accessReason });
      router.replace(`${AUTH_ROUTES.ACCESS_PENDING}?${params.toString()}`);
      return;
    }

    if (result?.data) {
      router.replace(AUTH_ROUTES.DASHBOARD);
    }
  }

  function handleForgotPasswordClick() {
    toast.info(AUTH_MESSAGES.FORGOT_PASSWORD_COMING_SOON);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription>
          Enter your credentials to access TalentProof Sales CRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Unable to sign in</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="you@company.com"
                      disabled={isSubmitting}
                      {...field}
                    />
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
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-sm"
                disabled={isSubmitting}
                onClick={handleForgotPasswordClick}
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
