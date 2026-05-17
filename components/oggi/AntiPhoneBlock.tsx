import { SmartphoneOff } from "@/lib/icons";

export function AntiPhoneBlock() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 flex items-start gap-3">
      <SmartphoneOff size={16} className="text-white/30 mt-0.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-white/30">prima di iniziare</p>
        <ul className="space-y-0.5">
          <li className="text-xs text-white/55">📵 Telefono fuori stanza</li>
          <li className="text-xs text-white/55">🔲 Una sola cosa aperta</li>
          <li className="text-xs text-white/55">⏱ 40 minuti senza cambio progetto</li>
        </ul>
      </div>
    </div>
  );
}
