"use client";

import type {
    ProfileFieldErrors,
    ProfileFormProps,
    ProfileUpdateResponse,
} from "@/app/lib/interfaces/profile-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarImage } from "@/app/ui/avatar-image";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// アバター画像の最大ファイルサイズ（2MB）
const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
// サポートするアバター画像のMIMEタイプ
const SUPPORTED_AVATAR_TYPES = new Set(["image/jpeg", "image/png"]);
export function ProfileForm({ initialValues }: ProfileFormProps) {
    const router = useRouter();

    // ユーザーが新しく選んだ画像ファイル
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    // 今保存されているプロフィール画像のパス
    const [avatarPath, setAvatarPath] = useState<null | string>(
        initialValues.avatar,
    );
    // 画面に表示する画像
    // 画像をまだ選んでいない → 今のプロフィール画像
    // 新しい画像を選んだ → そのプレビュー画像
    const [avatarSource, setAvatarSource] = useState<null | string>(
        initialValues.avatar,
    );
    const [bio, setBio] = useState(initialValues.bio ?? "");
    const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState(initialValues.name);

    // 親から渡された初期値が変わったら、フォームの中身も更新する
    useEffect(() => {
        setAvatarPath(initialValues.avatar);
        setBio(initialValues.bio ?? "");
        setName(initialValues.name);
    }, [initialValues.avatar, initialValues.bio, initialValues.name]);

    // 選んだ画像ファイルを、一時的に画面表示できるURLに変える
    // 新しい画像を選んでいないとき
    // → 今の画像を表示する
    // 新しい画像を選んだとき
    // → その画像をプレビュー表示する
    useEffect(() => {
        if (!avatarFile) {
            setAvatarSource(avatarPath);
            return;
        }

        const objectUrl = URL.createObjectURL(avatarFile);
        setAvatarSource(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [avatarFile, avatarPath]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.set("bio", bio);
            formData.set("name", name);

            if (avatarFile) {
                formData.set("avatarFile", avatarFile);
            }

            const response = await fetch("/api/profile", {
                body: formData,
                method: "PATCH",
            });

            if (response.ok) {
                const data = (await response.json()) as ProfileUpdateResponse;
                setAvatarFile(null);
                setAvatarPath(data.user.avatar);
                router.refresh();
                toast.success("プロフィールを更新しました。");
                return;
            }

            // 400 / 413 / 415 のときは、API から返ってきた入力エラーを表示する
            if (
                response.status === 400 ||
                response.status === 413 ||
                response.status === 415
            ) {
                const data = (await response.json()) as {
                    error?: string;
                    errors?: ProfileFieldErrors;
                };

                if (data.errors) {
                    setFieldErrors(data.errors);
                }

                if (!data.errors?.avatarFile && !data.errors?.name) {
                    toast.error(
                        data.error ?? "プロフィール更新に失敗しました。",
                    );
                }

                return;
            }

            toast.error("プロフィール更新に失敗しました。");
        } catch (error) {
            console.error("Profile update failed:", error);
            toast.error("プロフィール更新に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    // ユーザーが画像を選んだときの処理
    function handleAvatarFileChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        // 画像選択をやめたときなどファイルがないときは、選択されている画像をクリアする
        if (!file) {
            setAvatarFile(null);
            setFieldErrors((previousErrors) => ({
                ...previousErrors,
                avatarFile: undefined,
            }));
            return;
        }

        // JPG / PNG 以外ならエラー
        if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
            event.target.value = "";
            setAvatarFile(null);
            setFieldErrors((previousErrors) => ({
                ...previousErrors,
                avatarFile: ["JPGまたはPNG形式の画像を選択してください。"],
            }));
            return;
        }

        // マックスMBを超えたらエラー
        if (file.size > MAX_AVATAR_FILE_SIZE) {
            event.target.value = "";
            setAvatarFile(null);
            setFieldErrors((previousErrors) => ({
                ...previousErrors,
                avatarFile: ["画像サイズは2MB以下にしてください。"],
            }));
            return;
        }

        setAvatarFile(file);
        setFieldErrors((previousErrors) => ({
            ...previousErrors,
            avatarFile: undefined,
        }));
    }

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">プロフィール画像</CardTitle>
                    <CardDescription>
                        プロフィール画像を変更できます
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                        <AvatarImage
                            alt={`${name}のプロフィール画像`}
                            className="h-22 w-22"
                            fallbackText={name}
                            src={avatarSource}
                        />

                        <div className="w-full space-y-2">
                            <Label htmlFor="avatarFile">
                                新しいプロフィール画像をアップロード
                            </Label>
                            <input
                                accept="image/jpeg,image/png"
                                className="border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                id="avatarFile"
                                onChange={handleAvatarFileChange}
                                type="file"
                            />
                            <p className="text-sm text-slate-500">
                                JPG、PNG形式の画像をアップロードできます（最大2MB）
                            </p>
                            {fieldErrors.avatarFile?.[0] && (
                                <p className="text-sm text-red-500">
                                    {fieldErrors.avatarFile[0]}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">基本情報</CardTitle>
                    <CardDescription>
                        基本的なプロフィール情報を入力してください
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-md" htmlFor="name">
                            名前
                        </Label>
                        <Input
                            id="name"
                            onChange={(event) => {
                                setName(event.target.value);
                                setFieldErrors((previousErrors) => ({
                                    ...previousErrors,
                                    name: undefined,
                                }));
                            }}
                            required
                            type="text"
                            value={name}
                        />
                        {fieldErrors.name?.[0] && (
                            <p className="text-sm text-red-500">
                                {fieldErrors.name[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-md" htmlFor="email">
                            メールアドレス
                        </Label>
                        <Input
                            disabled
                            id="email"
                            type="email"
                            value={initialValues.email}
                        />
                        <p className="text-sm text-slate-500">
                            メールアドレスは変更できません。変更が必要な場合は管理者にお問い合わせください。
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-md" htmlFor="bio">
                            自己紹介
                        </Label>
                        <Textarea
                            className="min-h-[160px]"
                            id="bio"
                            onChange={(event) => setBio(event.target.value)}
                            placeholder="自己紹介を入力してください"
                            value={bio}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                <Button
                    onClick={() => router.back()}
                    type="button"
                    variant="outline"
                >
                    キャンセル
                </Button>
                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting
                        ? "プロフィールを更新中..."
                        : "プロフィールを更新する"}
                </Button>
            </div>
        </form>
    );
}
