import "@/styles/globals.css";

import type { RootLayoutProps } from "@/app/lib/interfaces/layout";
import type { Metadata } from "next";
import { FabCreate } from "@/app/ui/fab-create-post";
import { Footer } from "@/app/ui/footer";
import Navigation from "@/app/ui/navigation";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    description:
        "だてまきは、日本語教師が教案を探し、共有し、授業づくりのアイデアを広げられる教案共有サービスです。",
    title: "だてまき",
};

function RootLayout(props: RootLayoutProps) {
    return (
        <html lang="ja">
            <body>
                <div className="flex min-h-screen flex-col bg-white">
                    <Navigation />
                    <main className="container mx-auto flex flex-1 flex-col px-4 py-8">
                        <Toaster
                            duration={1500}
                            position="top-right"
                            richColors
                        />
                        {props.children}
                        <FabCreate />
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}

export default RootLayout;
