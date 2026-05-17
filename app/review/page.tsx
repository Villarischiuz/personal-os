import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewHistory } from "@/components/review/ReviewHistory";

export const metadata = { title: "Review settimanale — fralife" };

export default function ReviewPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white">Review settimanale</h1>
        <p className="text-sm text-white/40 mt-1">
          Rifletti, sistema, riprogramma.
        </p>
      </div>

      <ReviewForm />

      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Storico</h2>
        <ReviewHistory />
      </section>
    </div>
  );
}
