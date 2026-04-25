"use client";

import type { NavigationProps } from "@/app/lib/interfaces/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarImage } from "@/app/ui/avatar-image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import clsx from "clsx";
import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Navigation({ currentUser }: NavigationProps) {
    const pathname = usePathname();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const desktopNavLinkClasses = (href: string) =>
        clsx("hover:text-orange-300", {
            underline: pathname === href,
        });
    const mobileMenuLinkClasses = (href: string) =>
        clsx(
            "block rounded-md px-4 py-3 text-base font-medium text-slate-700 transition-colors",
            {
                "bg-orange-50 text-orange-500": pathname === href,
                "hover:bg-slate-100": pathname !== href,
            },
        );
    const profileDetailHref = currentUser
        ? `/users/${currentUser.id}?tab=details`
        : "#";
    const profilePostsHref = currentUser
        ? `/users/${currentUser.id}?tab=posts`
        : "#";

    return (
        <AlertDialog
            onOpenChange={setIsLogoutDialogOpen}
            open={isLogoutDialogOpen}
        >
            <header className="relative z-40 bg-white px-2 py-4 text-gray-800 shadow-sm">
                <nav className="flex w-full items-center justify-between px-4">
                    <Link className="flex items-center space-x-2" href="/">
                        <Image
                            alt="ロゴ"
                            height={50}
                            src="/datemaki_logo.svg"
                            width={50}
                        />
                        <span className="text-2xl font-bold text-orange-400">
                            だてまき
                        </span>
                    </Link>

                    <div className="hidden md:block">
                        <ul className="flex items-center space-x-4">
                            <li className="textalign-middle-center">
                                <Link
                                    className={desktopNavLinkClasses("/posts")}
                                    href="/posts"
                                >
                                    教案を探す
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className={desktopNavLinkClasses("/users")}
                                    href="/users"
                                >
                                    先生を探す
                                </Link>
                            </li>
                            <li>
                                {currentUser ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="h-14 w-14 rounded-full p-0 transition-colors outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
                                                type="button"
                                            >
                                                <AvatarImage
                                                    alt={`${currentUser.name}のプロフィール画像`}
                                                    className="h-14 w-14"
                                                    fallbackText={
                                                        currentUser.name
                                                    }
                                                    src={currentUser.avatar}
                                                />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="z-50"
                                        >
                                            <DropdownMenuItem asChild>
                                                <Link href={profileDetailHref}>
                                                    プロフィール
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/bookmarks">
                                                    ブックマーク
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={profilePostsHref}>
                                                    投稿した教案
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile/edit">
                                                    設定
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() =>
                                                    setIsLogoutDialogOpen(true)
                                                }
                                            >
                                                ログアウト
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link
                                        className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-400"
                                        href="/login"
                                    >
                                        ログイン
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </div>

                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    aria-label="メニューを開く"
                                    size="icon"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="p-0" side="right">
                                <SheetHeader className="border-b border-slate-200 pb-4">
                                    <SheetTitle>メニュー</SheetTitle>
                                </SheetHeader>

                                <div className="space-y-6 p-6">
                                    {currentUser ? (
                                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                                            <AvatarImage
                                                alt={`${currentUser.name}のプロフィール画像`}
                                                className="h-12 w-12"
                                                fallbackText={currentUser.name}
                                                src={currentUser.avatar}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm text-slate-500">
                                                    ログイン中
                                                </p>
                                                <p className="truncate font-medium text-slate-900">
                                                    {currentUser.name}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-slate-50 p-4">
                                            <p className="mb-3 text-sm text-slate-500">
                                                アカウントにログインすると、設定や教案管理にアクセスできます。
                                            </p>
                                            <SheetClose asChild>
                                                <Link
                                                    className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-400"
                                                    href="/login"
                                                >
                                                    ログイン
                                                </Link>
                                            </SheetClose>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <SheetClose asChild>
                                            <Link
                                                className={mobileMenuLinkClasses(
                                                    "/posts",
                                                )}
                                                href="/posts"
                                            >
                                                教案を探す
                                            </Link>
                                        </SheetClose>

                                        <SheetClose asChild>
                                            <Link
                                                className={mobileMenuLinkClasses(
                                                    "/users",
                                                )}
                                                href="/users"
                                            >
                                                先生を探す
                                            </Link>
                                        </SheetClose>

                                        {currentUser ? (
                                            <SheetClose asChild>
                                                <Link
                                                    className={mobileMenuLinkClasses(
                                                        profileDetailHref,
                                                    )}
                                                    href={profileDetailHref}
                                                >
                                                    プロフィール
                                                </Link>
                                            </SheetClose>
                                        ) : null}

                                        <SheetClose asChild>
                                            <Link
                                                className={mobileMenuLinkClasses(
                                                    "/bookmarks",
                                                )}
                                                href="/bookmarks"
                                            >
                                                ブックマーク
                                            </Link>
                                        </SheetClose>

                                        {currentUser ? (
                                            <SheetClose asChild>
                                                <Link
                                                    className={mobileMenuLinkClasses(
                                                        profilePostsHref,
                                                    )}
                                                    href={profilePostsHref}
                                                >
                                                    投稿した教案
                                                </Link>
                                            </SheetClose>
                                        ) : null}

                                        <SheetClose asChild>
                                            <Link
                                                className={mobileMenuLinkClasses(
                                                    "/profile/edit",
                                                )}
                                                href="/profile/edit"
                                            >
                                                設定
                                            </Link>
                                        </SheetClose>

                                        {currentUser ? (
                                            <button
                                                className={clsx(
                                                    "block w-full rounded-md px-4 py-3 text-left text-base font-medium text-slate-700 transition-colors hover:bg-slate-100",
                                                )}
                                                onClick={() =>
                                                    setIsLogoutDialogOpen(true)
                                                }
                                                type="button"
                                            >
                                                ログアウト
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </nav>
            </header>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ログアウト</AlertDialogTitle>
                    <AlertDialogDescription>
                        ログアウトしてもよろしいでしょうか？
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>いいえ</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmLogout}>
                        はい
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function handleConfirmLogout() {
    void signOut({ callbackUrl: "/" });
}
