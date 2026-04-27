import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "プライバシーポリシー | だてまき",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-1 justify-center px-4 py-6 md:px-6 md:py-10">
            <Card className="w-full max-w-5xl p-6">
                <CardHeader className="border-b border-slate-200 py-8">
                    <CardTitle className="text-3xl font-bold text-slate-950 md:text-4xl">
                        プライバシーポリシー
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 py-8">
                    <p className="text-base leading-8 text-slate-700">
                        だてまき（以下、「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第一条 個人情報
                        </h2>
                        <p className="text-base leading-8 text-slate-700">
                            本サービスが「個人情報」として取り扱うのは、氏名、住所、電話番号、メールアドレス、その他の特定の個人を識別できる情報を指します。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第二条 個人情報を収集・利用する目的
                        </h2>
                        <p className="text-base leading-8 text-slate-700">
                            本サービスは以下の目的のために、必要な範囲内で個人情報を収集し、利用します。
                        </p>
                        <ul className="space-y-2 text-base leading-8 text-slate-700">
                            <li>
                                ・本サービスの提供および運営に必要な範囲での利用
                            </li>
                            <li>・本サービスに関するお問い合わせへの対応</li>
                            <li>・運営者からのご案内、お知らせ等の送付</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第三条 利用目的の変更
                        </h2>
                        <ul className="space-y-2 text-base leading-8 text-slate-700">
                            <li>
                                １．本サービスは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
                            </li>
                            <li>
                                ２．利用目的の変更を行った場合には、変更後の目的について、当方所定の方法により、本サービス上に公表するものとします。
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第四条 個人情報の第三者提供
                        </h2>
                        <p className="text-base leading-8 text-slate-700">
                            １．運営者は、法令に基づく場合を除き、事前に本人の同意を得ることなく、収集した個人情報を第三者に提供することはありません。ただし、以下の場合にはこの限りではありません。
                        </p>
                        <ul className="space-y-2 text-base leading-8 text-slate-700">
                            <li>（１）法令に基づく場合</li>
                            <li>
                                （２）人の生命、身体または財産の保護のために必要がある場合であり、本人の同意を得ることが困難である場合
                            </li>
                            <li>
                                （３）国の機関または地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であり、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合
                            </li>
                        </ul>
                        <p className="pt-2 text-base leading-8 text-slate-700">
                            ２．前項の定めにかかわらず、以下の場合は、提携する企業等への提供が行われることがあります。
                        </p>
                        <ul className="space-y-2 text-base leading-8 text-slate-700">
                            <li>
                                （１）運営者が取り扱うサービスを提供するために、提携する企業等へ必要な範囲で提供する場合
                            </li>
                            <li>
                                （２）運営者が取り扱うサービスにおいて、ユーザーに対する情報提供、プロモーション等を行うために、提携する企業等へ提供する場合
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第五条 個人情報の訂正および削除
                        </h2>
                        <ul className="space-y-2 text-base leading-8 text-slate-700">
                            <li>
                                １．ユーザーは、運営者が保有する自己の個人情報が誤った情報である場合には、運営者が定める手続きにより、運営者に対して個人情報の訂正を請求することができます。
                            </li>
                            <li>
                                ２．運営者は、ユーザーから個人情報の訂正または削除の請求があった場合、合理的な期間内に調査を行い、必要な範囲内で速やかに個人情報の訂正または削除を行うものとします。
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第六条 個人情報の利用停止等
                        </h2>
                        <p className="text-base leading-8 text-slate-700">
                            本サービスの運営者は、ご本人からの求めにより、ご本人の個人情報の利用停止または消去を行うことができるものとします。ただし、運営者は、法令に基づく場合や正当な理由がある場合を除き、速やかに対応いたします。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-950">
                            ■第七条 プライバシーポリシーの変更
                        </h2>
                        <p className="text-base leading-8 text-slate-700">
                            本サービスの運営者は、必要に応じて、本ポリシーを変更することがあります。変更後の本ポリシーについては、本サービスのプライバシーポリシーに掲載した時点より効力を生じるものとします。
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
