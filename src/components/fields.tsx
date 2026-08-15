import type { ChangeEvent } from 'react';
import { BANDEIRAS, DISTRIBUIDORAS } from '@/data/energia-br';
import type { Dict } from '@/i18n';

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  min?: number;
  step?: number;
  placeholder?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  help,
  min = 0,
  step = 0.01,
  placeholder,
}: NumberFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {help ? <p className="help">{help}</p> : null}
    </div>
  );
}

export interface TariffState {
  distribuidora: string; // '' = manual
  baseRsKwh: string;
  bandeiraId: string;
}

export const initialTariff: TariffState = {
  distribuidora: '',
  baseRsKwh: '',
  bandeiraId: 'verde',
};

export function tariffFromState(state: TariffState): {
  baseRsKwh: number;
  bandeiraRsPor100Kwh: number;
} | null {
  const preset = DISTRIBUIDORAS.find((d) => d.name === state.distribuidora);
  const base = preset ? preset.tarifaRsKwh : Number.parseFloat(state.baseRsKwh);
  if (!Number.isFinite(base) || base <= 0) return null;
  const bandeira = BANDEIRAS.find((b) => b.id === state.bandeiraId);
  return { baseRsKwh: base, bandeiraRsPor100Kwh: bandeira?.adicionalRsPor100Kwh ?? 0 };
}

interface TariffFieldsProps {
  t: Dict;
  state: TariffState;
  onChange: (state: TariffState) => void;
}

export function TariffFields({ t, state, onChange }: TariffFieldsProps) {
  const hasPresets = DISTRIBUIDORAS.length > 0;
  const preset = DISTRIBUIDORAS.find((d) => d.name === state.distribuidora);
  return (
    <fieldset>
      <legend>{t.tariff.legend}</legend>
      <div className="grid-2">
        {hasPresets ? (
          <div className="field">
            <label htmlFor="tariff-dist">{t.tariff.distribuidoraLabel}</label>
            <select
              id="tariff-dist"
              value={state.distribuidora}
              onChange={(e) => onChange({ ...state, distribuidora: e.target.value })}
            >
              <option value="">{t.tariff.distribuidoraCustom}</option>
              {DISTRIBUIDORAS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.uf}) — R$ {d.tarifaRsKwh.toFixed(2)}/kWh
                </option>
              ))}
            </select>
            {preset ? (
              <p className="help">
                {preset.classe}, {preset.ano} — {preset.fonte}
              </p>
            ) : null}
          </div>
        ) : null}
        {!preset ? (
          <NumberField
            id="tariff-base"
            label={t.tariff.baseLabel}
            value={state.baseRsKwh}
            onChange={(v) => onChange({ ...state, baseRsKwh: v })}
            help={t.tariff.baseHelp}
            step={0.01}
            placeholder="0,75"
          />
        ) : null}
        <div className="field">
          <label htmlFor="tariff-bandeira">{t.tariff.bandeiraLabel}</label>
          <select
            id="tariff-bandeira"
            value={state.bandeiraId}
            onChange={(e) => onChange({ ...state, bandeiraId: e.target.value })}
          >
            {BANDEIRAS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.labelPt}
                {b.adicionalRsPor100Kwh > 0
                  ? ` — +R$ ${b.adicionalRsPor100Kwh.toFixed(3)}/100 kWh`
                  : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
