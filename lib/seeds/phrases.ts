export const DAILY_PHRASES: string[] = [
  "Oggi vinco se faccio una cosa per costruirmi e una per vivermi.",
  "La dispersione è il nemico. Fai una cosa alla volta.",
  "Non serve essere perfetto. Serve essere presente.",
  "Ogni sessione da 40 minuti è un mattone. Posa il mattone.",
  "Il progresso è silenzioso. La costanza è rumorosa.",
  "Non stai costruendo l'app della tua vita. Stai vivendo la tua vita.",
  "Meno task, più profondità. Tre priorità, non dieci.",
  "Ogni giorno che chiudi bene è una vittoria reale.",
  "Il focus non è fare di più. È fare meglio ciò che conta.",
  "Inizia. Il resto viene da sé.",
  "Outreach, IELTS, corpo. Tre fronti. Ogni giorno.",
  "Ciò che misuri, migliora. Segna le spese. Pesa il petto.",
  "Una cosa aperta. Quaranta minuti. Telefono fuori.",
  "I secondari non rubano tempo al principale.",
  "La review domenicale non è un giudizio. È una bussola.",
];

export function getPhraseForToday(): string {
  const dayOfYear = getDayOfYear(new Date());
  return DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
