/**
 * Component for configuring analysis model, quality model, and target language options.
 */

import { ModelSelector } from "@/components/ModelSelector";
import { ComboboxOption } from "@/components/ui/editable-combobox";
import { useLanguageSelection, useModelSelection, useUserPreferences } from "@/hooks/use-config";
import { getProviderLogo } from "@/lib/provider-logos";
import { Bot, Languages, Sparkles } from "lucide-react";

export function VideoProcessingOptions() {
  const { languages } = useLanguageSelection();
  const { summarizerModels, refinerModels } = useModelSelection();
  const { preferences, updatePreferences } = useUserPreferences();

  const toOption = (m: { key: string; label: string; provider?: string; flag?: string }): ComboboxOption => ({
    value: m.key,
    label: m.label,
    icon: m.provider ? (
      <img src={getProviderLogo(m.provider) as string} alt={m.provider} className="w-full h-full object-contain" />
    ) : m.flag ? (
      <span className="text-sm">{m.flag}</span>
    ) : undefined,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-border bg-secondary/50 p-4">
      <ModelSelector
        label="Summarizer"
        icon={Bot}
        value={preferences.analysisModel}
        onChange={(value) => updatePreferences({ analysisModel: value })}
        options={summarizerModels.map(toOption)}
        placeholder="Select summarizer..."
      />

      <ModelSelector
        label="Refiner"
        icon={Sparkles}
        value={preferences.qualityModel}
        onChange={(value) => updatePreferences({ qualityModel: value })}
        options={refinerModels.map(toOption)}
        placeholder="Select refiner..."
      />

      <ModelSelector
        label="Language"
        icon={Languages}
        value={preferences.targetLanguage}
        onChange={(value) => updatePreferences({ targetLanguage: value })}
        options={languages.map(toOption)}
        placeholder="Select language..."
      />
    </div>
  );
}
