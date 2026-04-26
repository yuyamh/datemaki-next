import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationLinkProps extends React.ComponentProps<typeof Link> {
    isActive?: boolean;
    size?: PaginationLinkSize;
}

type PaginationLinkSize =
    | "default"
    | "icon"
    | "icon-lg"
    | "icon-sm"
    | "lg"
    | "sm";

interface PaginationNavigationLinkProps extends PaginationLinkProps {
    text?: string;
}

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            aria-label="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            role="navigation"
            {...props}
        />
    );
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            className={cn("flex flex-row items-center gap-1", className)}
            {...props}
        />
    );
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            aria-hidden
            className={cn("flex size-9 items-center justify-center", className)}
            {...props}
        >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

function PaginationItem(props: React.ComponentProps<"li">) {
    return <li {...props} />;
}

function PaginationLink({
    className,
    isActive,
    size = "icon",
    ...props
}: PaginationLinkProps) {
    return (
        <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
                buttonVariants({
                    size,
                    variant: isActive ? "outline" : "ghost",
                }),
                className,
            )}
            {...props}
        />
    );
}

function PaginationNext({
    className,
    size = "default",
    text = "Next",
    ...props
}: PaginationNavigationLinkProps) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            className={cn("gap-1 pr-2.5", className)}
            size={size}
            {...props}
        >
            <span>{text}</span>
            <ChevronRight />
        </PaginationLink>
    );
}

function PaginationPrevious({
    className,
    size = "default",
    text = "Previous",
    ...props
}: PaginationNavigationLinkProps) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            className={cn("gap-1 pl-2.5", className)}
            size={size}
            {...props}
        >
            <ChevronLeft />
            <span>{text}</span>
        </PaginationLink>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
