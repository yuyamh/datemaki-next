"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import clsx from "clsx";

export default function Navigation() {
    const pathname = usePathname();

    const navLinkClasses = (href: string) =>
        clsx("hover:text-orange-300", {
            underline: pathname === href,
        });

    return (
        <header className="bg-white px-2 py-4 text-gray-800 shadow-sm">
            <nav className="flex w-full items-center justify-between px-4">
                <Link className="flex items-center space-x-2" href="/">
                    <Image
                        alt="ロゴ"
                        height={50}
                        src="/datemaki_logo.svg"
                        width={50}
                    ></Image>
                    <span className="text-2xl font-bold text-orange-400">
                        だてまき
                    </span>
                </Link>
                <div>
                    <ul className="flex items-center space-x-4">
                        <li className="textalign-middle-center">
                            <Link
                                className={navLinkClasses("/posts")}
                                href="/posts"
                            >
                                教案を探す
                            </Link>
                        </li>
                        <li>
                            <Link className={navLinkClasses("#")} href="#">
                                先生を探す
                            </Link>
                        </li>
                        <li>
                            <NavigationMenu>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="rounded-full">
                                            プロフ
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent className="text-nowrap">
                                            <NavigationMenuLink>
                                                プロフィール
                                            </NavigationMenuLink>
                                            <NavigationMenuLink>
                                                ブックマーク
                                            </NavigationMenuLink>
                                            <NavigationMenuLink>
                                                投稿した教案
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="/profile/edit">
                                                    設定
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink>
                                                ログアウト
                                            </NavigationMenuLink>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
