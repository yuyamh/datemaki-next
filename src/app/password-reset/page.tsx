import { Suspense } from "react";
import { PasswordResetForm } from "@/app/ui/password-reset-form";

export default function PasswordResetPage() {
    return (
        <Suspense>
            <PasswordResetForm />
        </Suspense>
    );
}
