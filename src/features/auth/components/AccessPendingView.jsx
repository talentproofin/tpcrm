"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTH_ROUTES } from "../constants/routes";
import { getAccessDeniedMessage } from "../constants/access";

export function AccessPendingView() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const message = getAccessDeniedMessage(reason);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Access Pending
        </CardTitle>
        <CardDescription className="whitespace-pre-line text-base text-foreground">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild variant="outline">
          <Link href={AUTH_ROUTES.LOGIN}>Return to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
