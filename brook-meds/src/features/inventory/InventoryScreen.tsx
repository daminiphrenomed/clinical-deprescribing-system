import { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
import InsightStrip from '../../components/shared/InsightStrip';
import SembleStrip from '../../components/shared/SembleStrip';
import { fetchInventory } from '../../api/semble';
import { wholesalerPrices } from '../../api/mocks/fixtures';
import type { StockLine, WholesalerPrice } from '../../lib/types';

function expiryColor(expiryIso: string): string {
  const days = Math.floor((new Date(expiryIso).getTime() - Date.now()) / 86400000);
  if (days <= 7) return 'var(--red)';
  if (days <= 30) return 'var(--amber)';
  return 'var(--text-muted)';
}

function earliestExpiry(line: StockLine): string {
  return line.packsByLot
    .map(l => l.expiry)
    .sort()[0] ?? '';
}

export default function InventoryScreen() {
  const [lines, setLines] = useState<StockLine[]>([]);

  useEffect(() => {
    fetchInventory().then(setLines);
  }, []);

  const totalValue = lines.reduce((s, l) => s + l.costPerPack * l.packCount, 0);
  const activeCount = lines.length;
  const expiringCount = lines.filter(l => {
    const exp = earliestExpiry(l);
    if (!exp) return false;
    const days = Math.floor((new Date(exp).getTime() - Date.now()) / 86400000);
    return days <= 30;
  }).length;
  const belowReorderCount = lines.filter(l => l.packCount <= l.reorderPoint).length;

  const reorderLines = lines.filter(l => l.packCount <= l.reorderPoint);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Inventory</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Stock levels, expiry tracking, and reorder suggestions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-action text-white text-sm font-medium"
          style={{ background: 'var(--accent)' }}
        >
          <Scan size={16} /> Goods inward (scan barcode)
        </button>
      </div>

      <InsightStrip>
        Reorder suggestions are decision support, not automatic procurement. You review and approve before any order is placed.
      </InsightStrip>

      <SembleStrip
        reads="None — inventory is Brook Meds-owned"
        writes="None direct (billing lines written at dispense)"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total stock value', value: `£${totalValue.toFixed(2)}` },
          { label: 'Active lines', value: activeCount },
          { label: 'Expiring ≤30 days', value: expiringCount, warn: expiringCount > 0 },
          { label: 'Below reorder point', value: belowReorderCount, warn: belowReorderCount > 0 },
        ].map(card => (
          <div key={card.label} className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: card.warn ? 'var(--amber)' : 'var(--border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: card.warn ? 'var(--amber)' : 'var(--navy)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '60% 40%' }}>
        {/* Stock table */}
        <div className="rounded-card border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>Stock lines</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Drug</th>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Location</th>
                <th className="text-right py-2 font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>Qty</th>
                <th className="text-right py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => {
                const exp = earliestExpiry(line);
                return (
                  <tr key={line.gtin} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium" style={{ color: 'var(--text)' }}>
                        {line.drug.name} {line.drug.strength}
                        {line.isCd && (
                          <span className="ml-1.5 text-xs px-1 py-0.5 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>CD</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-faint)' }}>{line.packSize}</div>
                    </td>
                    <td className="py-2.5" style={{ color: 'var(--text-muted)' }}>{line.location}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold" style={{ color: line.packCount <= line.reorderPoint ? 'var(--red)' : 'var(--text)' }}>
                      {line.packCount}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: expiryColor(exp) }}>
                      {exp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reorder suggestions */}
        <div>
          <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>Reorder suggestions</h2>
              <button
                className="text-xs px-2 py-1 rounded border"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
                onClick={() => {
                  const csv = reorderLines.map(l => `${l.drug.name} ${l.drug.strength},${l.suggestedReorderQty ?? l.reorderPoint}`).join('\n');
                  console.log('CSV:', csv);
                }}
              >
                Copy list as CSV
              </button>
            </div>
            <div className="space-y-3">
              {reorderLines.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-faint)' }}>All lines above reorder point</p>
              )}
              {reorderLines.map(line => {
                const prices: WholesalerPrice[] = wholesalerPrices[line.gtin] ?? [
                  { wholesaler: 'AAH', pricePerPack: 5.00, cdLicensed: false },
                  { wholesaler: 'Alliance', pricePerPack: 5.20, cdLicensed: false },
                  { wholesaler: 'Phoenix', pricePerPack: 4.90, cdLicensed: false },
                ];
                const sorted = [...prices].sort((a, b) => a.pricePerPack - b.pricePerPack);
                const bestPrice = sorted[0];
                return (
                  <div key={line.gtin} className="rounded-input border p-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="font-medium text-sm mb-1" style={{ color: 'var(--text)' }}>
                      {line.drug.name} {line.drug.strength}
                      {line.isCd && (
                        <span className="ml-1.5 text-xs px-1 py-0.5 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>CD</span>
                      )}
                    </div>
                    <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      Suggest ordering {line.suggestedReorderQty ?? line.reorderPoint} packs · Current: {line.packCount}
                    </div>
                    <div className="space-y-1">
                      {sorted.map(price => (
                        <div key={price.wholesaler} className="flex items-center justify-between text-xs">
                          <span style={{ color: 'var(--text-muted)' }}>{price.wholesaler}</span>
                          <span
                            className="tabular-nums font-medium"
                            style={{ color: price.wholesaler === bestPrice.wholesaler ? 'var(--green)' : 'var(--text)' }}
                          >
                            £{price.pricePerPack.toFixed(2)}
                            {price.wholesaler === bestPrice.wholesaler && ' ✓ best'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
