"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema, registerSchema, type RegisterInput } from "@/lib/schemas";

type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
  role?: RegisterInput["role"];
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "organizer@stadiumgpt.ai", password: "StadiumGPT2026!" }
        : { email: "", password: "", name: "", role: "FAN" }
  });

  async function onSubmit(values: AuthFormValues) {
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const payload =
      mode === "login"
        ? { email: values.email, password: values.password }
        : {
            email: values.email,
            password: values.password,
            name: values.name,
            role: values.role
          };
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          {mode === "login" ? "Login" : "Create Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          {mode === "register" && (
            <>
              <label className="grid gap-2 text-sm font-semibold">
                Name
                <Input aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Role
                <select className="h-10 rounded-lg border border-border bg-background px-3" {...form.register("role")}>
                  {["FAN", "ORGANIZER", "VOLUNTEER", "SECURITY", "MEDICAL", "ADMIN"].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <Input type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Password
            <Input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
          </label>
          <Button type="submit">{mode === "login" ? "Sign in" : "Register"}</Button>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Need access?" : "Already have access?"}{" "}
            <Link className="font-semibold text-primary" href={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Register" : "Login"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
