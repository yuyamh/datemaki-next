import { env } from "@/env";

function Page() {
    const message = env.DEBUG_MESSAGE;

    return (
        <main>
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold">Hello World</h1>
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
            </div>
        </main>
    );
}

export default Page;
