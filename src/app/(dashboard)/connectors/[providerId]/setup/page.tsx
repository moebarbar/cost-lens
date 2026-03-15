"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTeams, mapApiKeyToTeam } from "@/hooks/use-api";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { Key, ChevronLeft, Check, AlertTriangle, Save, Users } from "lucide-react";

interface DiscoveredKey {
  keyPrefix: string;
  maskedKey: string;
  requestCount: number;
  totalCost: number;
  projectName: string | null;
  teamId: string | null;
  teamName: string | null;
  teamColor: string | null;
  keyAlias: string | null;
  mappingId: string | null;
}

export default function AttributionSetupPage() {
  const params = useParams();
  const router = useRouter();
  const connectorId = params.providerId as string;

  const [keys, setKeys] = useState<DiscoveredKey[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { teamId: string; alias: string }>>({});
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: teams } = useTeams();

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch(`/api/connectors/${connectorId}/keys`);
      const json = await res.json();
      if (json.success) {
        setKeys(json.data);
        // Pre-fill assignments from existing mappings
        const initial: Record<string, { teamId: string; alias: string }> = {};
        for (const key of json.data as DiscoveredKey[]) {
          initial[key.keyPrefix] = {
            teamId: key.teamId ?? "",
            alias: key.keyAlias ?? "",
          };
        }
        setAssignments(initial);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Failed to load discovered keys");
    } finally {
      setLoadingKeys(false);
    }
  }, [connectorId]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  function setTeam(keyPrefix: string, teamId: string) {
    setAssignments(prev => ({
      ...prev,
      [keyPrefix]: { ...prev[keyPrefix], teamId },
    }));
  }

  function setAlias(keyPrefix: string, alias: string) {
    setAssignments(prev => ({
      ...prev,
      [keyPrefix]: { ...prev[keyPrefix], alias },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const key = keys.find(k => assignments[k.keyPrefix]?.teamId);
      if (!key) {
        setSaving(false);
        return;
      }

      // Save each key mapping
      const promises = keys
        .filter(k => assignments[k.keyPrefix]?.teamId)
        .map(k =>
          mapApiKeyToTeam(
            assignments[k.keyPrefix].teamId,
            k.keyPrefix,
            "OPENAI", // provider comes from connector — simplified here
            assignments[k.keyPrefix].alias || undefined
          )
        );

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        setError(`${failed.length} mapping(s) failed to save.`);
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => router.push("/overview"), 1500);
    } catch {
      setError("Failed to save attribution map");
    } finally {
      setSaving(false);
    }
  }

  const assignedCount = Object.values(assignments).filter(a => a.teamId).length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/connectors" className="mt-1 text-[#475569] hover:text-[#00F0FF] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-3">
            <Key className="w-6 h-6 text-[#00F0FF]" />
            API Key Attribution
          </h1>
          <p className="text-sm font-mono text-[#94A3B8] mt-1">
            Assign each discovered API key to a team so spend can be attributed correctly.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {!loadingKeys && keys.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-black/20 border border-white/5 rounded-xl">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[#94A3B8]">ATTRIBUTION PROGRESS</span>
              <span className="text-[#00F0FF]">{assignedCount} / {keys.length} keys mapped</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00F0FF] to-[#00FF88] rounded-full transition-all duration-500"
                style={{ width: keys.length > 0 ? `${(assignedCount / keys.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {keys.length > 0 ? Math.round((assignedCount / keys.length) * 100) : 0}%
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingKeys && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 border border-[#FF3366]/30 bg-[#FF3366]/5 rounded-xl text-[#FF3366] font-mono text-sm flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loadingKeys && keys.length === 0 && !error && (
        <GlassCard className="p-12 text-center">
          <Key className="w-10 h-10 text-[#475569] mx-auto mb-4" />
          <h3 className="text-lg font-heading font-bold text-white mb-2">No API Keys Discovered</h3>
          <p className="text-sm text-[#64748B]">
            This connector hasn&apos;t synced any usage data yet. Run a sync first to discover API keys.
          </p>
          <div className="mt-6">
            <GlowButton href="/connectors" variant="outline">Back to Connectors</GlowButton>
          </div>
        </GlassCard>
      )}

      {/* Key Rows */}
      {!loadingKeys && keys.length > 0 && (
        <div className="flex flex-col gap-4">
          {keys.map((key, i) => (
            <GlassCard key={key.keyPrefix} className="p-5" animateIn delayIndex={i % 4}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                {/* Key Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-3.5 h-3.5 text-[#475569]" />
                    <span className="font-mono text-sm text-white">{key.maskedKey}</span>
                    {key.projectName && (
                      <span className="text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF]/20 bg-[#00F0FF]/5 px-1.5 py-0.5 rounded">
                        {key.projectName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-[#475569]">
                    <span>{key.requestCount.toLocaleString()} requests</span>
                    <span className="text-[#00FF88] font-bold">${key.totalCost.toFixed(2)} total</span>
                  </div>
                </div>

                {/* Nickname Input */}
                <input
                  type="text"
                  placeholder="Key nickname (optional)"
                  value={assignments[key.keyPrefix]?.alias ?? ""}
                  onChange={e => setAlias(key.keyPrefix, e.target.value)}
                  className="input font-mono text-sm bg-black/40 w-full sm:w-44 shrink-0"
                />

                {/* Team Assignment Dropdown */}
                <div className="relative w-full sm:w-52 shrink-0">
                  <select
                    value={assignments[key.keyPrefix]?.teamId ?? ""}
                    onChange={e => setTeam(key.keyPrefix, e.target.value)}
                    className="input font-mono text-sm bg-black/40 w-full appearance-none cursor-pointer pr-8"
                  >
                    <option value="">— Unassigned —</option>
                    {(teams ?? []).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
                </div>

                {/* Status indicator */}
                <div className="w-6 shrink-0 flex items-center justify-center">
                  {assignments[key.keyPrefix]?.teamId ? (
                    <div className="w-5 h-5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#00FF88]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#475569]/10 border border-[#475569]/30" />
                  )}
                </div>

              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Actions */}
      {!loadingKeys && keys.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-xs font-mono text-[#475569]">
            Unassigned keys will show as unattributed spend in your dashboard.
          </p>
          <div className="flex gap-3">
            <GlowButton href="/overview" variant="ghost" className="border border-white/10 text-sm">
              Skip for now
            </GlowButton>
            <GlowButton
              variant="primary"
              className="text-sm"
              onClick={handleSave}
              disabled={saving || assignedCount === 0}
              icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            >
              {saved ? "Saved!" : saving ? "Saving..." : `Save ${assignedCount} Mapping${assignedCount !== 1 ? "s" : ""}`}
            </GlowButton>
          </div>
        </div>
      )}

    </div>
  );
}
