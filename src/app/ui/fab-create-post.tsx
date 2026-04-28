"use client";

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";

export function FabCreate() {
    return (
        <Button
            className="fixed right-8 bottom-8 z-50 h-18 w-18 rounded-full shadow-lg hover:bg-amber-300"
            onClick={() => {
                redirect("/posts/new");
            }}
            size="icon"
            type="button"
        >
            <PencilLine className="h-6 w-6" />
        </Button>
    );
}
