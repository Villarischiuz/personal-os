"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MOCK_WORKOUT_ENTRIES,
  MOCK_INVENTORY,
  MOCK_MACRO_LOGS,
} from "@/lib/mock-data";
import {
  buildOverloadTable,
  getLowStockItems,
  getDaysUntilDepletion,
} from "@/lib/computations";
import { TrendingUp, TrendingDown, Minus, Package, ShoppingCart, Trophy, Copy, Check } from "@/lib/icons";
import { cn, pct } from "@/lib/utils";

export default function PhysicalPage() {
  const [copied, setCopied] = useState(false);
  const overloadRows = buildOverloadTable(MOCK_WORKOUT_ENTRIES);
  const lowStock = getLowStockItems(MOCK_INVENTORY);
  const todayMacros = MOCK_MACRO_LOGS[MOCK_MACRO_LOGS.length - 1];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Piano Fisico</h1>
        <p className="mt-1 text-sm text-white/40">
          Overload progressivo · Inventario · Macro
        </p>
      </div>

      {/* ─── Overload Table ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Overload Progressivo</CardTitle>
          <span className="text-xs text-white/30">Sessione precedente → attuale</span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-xs text-white/35">
                  <th className="pb-3 pr-4 font-medium">Esercizio</th>
                  <th className="pb-3 pr-4 font-medium">Gruppo</th>
                  <th className="pb-3 pr-4 font-medium text-right">Prec.</th>
                  <th className="pb-3 pr-4 font-medium text-right">Attuale</th>
                  <th className="pb-3 font-medium text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {overloadRows.map((row) => {
                  const prev = row.prev_weight !== null
                    ? `${row.prev_weight}${row.weight_unit} × ${row.prev_reps}r`
                    : "—";
                  const curr = row.curr_weight !== null
                    ? `${row.curr_weight}${row.weight_unit} × ${row.curr_reps}r`
                    : "—";

                  return (
                    <tr key={row.exercise} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          {row.exercise}
                          {row.is_pr && (
                            <Trophy size={12} className="text-yellow-500" aria-label="Personal Record" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/50">
                          {row.muscle_group}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-xs text-white/40">{prev}</td>
                      <td className="py-3 pr-4 text-right font-mono text-xs text-white">{curr}</td>
                      <td className="py-3 text-center">
                        {row.overload_achieved ? (
                          <TrendingUp size={16} className="mx-auto text-green-400" />
                        ) : row.prev_weight === null ? (
                          <Minus size={16} className="mx-auto text-white/20" />
                        ) : (
                          <TrendingDown size={16} className="mx-auto text-yellow-400" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ─── Low Stock Alert ─────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Scorte in Esaurimento</CardTitle>
            {lowStock.length > 0 && (
              <Badge variant="danger">{lowStock.length} da ordinare</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="py-4 text-center text-sm text-white/30">Tutte le scorte sono ok.</p>
            ) : (
              <>
                {lowStock.map((item) => {
                  const days = getDaysUntilDepletion(item);
                  return (
                    <div key={item.id} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={13} className="text-red-400" />
                          <span className="text-sm font-medium text-white">{item.name}</span>
                        </div>
                        <span className="text-xs text-red-400">
                          {days === Infinity ? "∞" : `~${days}gg`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                        <span>{item.current_stock} {item.unit} rimasti</span>
                        <span>soglia: {item.threshold} {item.unit}</span>
                      </div>
                      <Progress
                        value={pct(item.current_stock, item.threshold)}
                        barClassName="bg-red-500"
                      />
                    </div>
                  );
                })}
                {/* Copy grocery list */}
                <button
                  onClick={() => {
                    const text = lowStock
                      .map((i) => `• ${i.name} (${i.current_stock} ${i.unit} rimasti)`)
                      .join("\n");
                    navigator.clipboard.writeText(`Lista spesa:\n${text}`).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all active:scale-95",
                    copied
                      ? "border-green-500/40 bg-green-500/10 text-green-400"
                      : "border-white/15 bg-white/5 text-white/60 hover:bg-white/8 hover:text-white"
                  )}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Lista copiata!" : "Copia lista spesa"}
                </button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ─── Full Inventory ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario Completo</CardTitle>
            <span className="text-xs text-white/30">{MOCK_INVENTORY.length} prodotti tracciati</span>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_INVENTORY.map((item) => {
              const stockPct = pct(item.current_stock, item.threshold * 2);
              const isLow = item.current_stock <= item.threshold;
              return (
                <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white truncate">{item.name}</span>
                      <span className={cn("text-[10px] font-mono", isLow ? "text-red-400" : "text-white/40")}>
                        {item.current_stock} {item.unit}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stockPct, 100)}
                      barClassName={isLow ? "bg-red-500" : "bg-emerald-500"}
                    />
                  </div>
                  {item.auto_reorder && (
                    <ShoppingCart size={12} className="flex-shrink-0 text-white/20" aria-label="Auto-riordino attivo" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ─── Macros Today ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Macro di Oggi</CardTitle>
          <span className={cn("text-xs font-semibold", todayMacros && pct(todayMacros.protein_g_actual, todayMacros.protein_g_target) >= 90 ? "text-green-400" : "text-yellow-400")}>
            {todayMacros ? `${todayMacros.calories_actual} / ${todayMacros.calories_target} kcal` : "—"}
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Calorie", actual: todayMacros.calories_actual, target: todayMacros.calories_target, unit: "kcal", color: "bg-blue-500" },
              { label: "Proteine", actual: todayMacros.protein_g_actual, target: todayMacros.protein_g_target, unit: "g", color: "bg-green-500" },
              { label: "Carboidrati", actual: todayMacros.carbs_g_actual, target: todayMacros.carbs_g_target, unit: "g", color: "bg-yellow-500" },
              { label: "Grassi", actual: todayMacros.fat_g_actual, target: todayMacros.fat_g_target, unit: "g", color: "bg-purple-500" },
            ].map(({ label, actual, target, unit, color }) => {
              const p = pct(actual, target);
              return (
                <div key={label} className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="mb-1 text-xs text-white/40">{label}</p>
                  <p className="mb-2 font-mono text-lg font-bold text-white">{actual}<span className="text-sm text-white/30">/{target}{unit}</span></p>
                  <Progress value={p} barClassName={color} />
                  <p className="mt-1 text-right text-[10px] text-white/30">{Math.round(p)}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
