import type { AvatarImageProps } from "@/app/lib/interfaces/avatar-image";
import { buildAvatarPublicUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";

export function AvatarImage({
    alt,
    className,
    fallbackText,
    src,
}: AvatarImageProps) {
    const imageUrl = buildAvatarPublicUrl(src);
    const initial = fallbackText?.trim().slice(0, 1);

    return (
        <div
            className={cn(
                "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500",
                className,
            )}
        >
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    alt={alt}
                    className="h-full w-full object-cover"
                    src={imageUrl}
                />
            ) : initial ? (
                <span className="font-semibold">{initial}</span>
            ) : (
                <UserRound className="h-5 w-5" />
            )}
        </div>
    );
}
