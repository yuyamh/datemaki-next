import { redirect } from "next/navigation";
import { ContactForm } from "@/app/ui/contact-form";
import { auth } from "@/auth";

export default async function ContactPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login?redirectTo=/contact");
    }

    return <ContactForm />;
}
