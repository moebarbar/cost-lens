"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { Settings, Shield, Bell, Palette, Database, Key, Save, User } from "lucide-react";

const SECTIONS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "security",      label: "Security",        icon: Shield },
  { id: "notifications", label: "Notifications",   icon: Bell },
  { id: "appearance",    label: "Appearance",      icon: Palette },
  { id: "data",          label: "Data & Privacy",  icon: Database },
  { id: "api",           label: "API Keys",        icon: Key },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20 p-6 rounded-xl border border-white/5">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-wide flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#94A3B8]" />
            System Configuration
          </h1>
          <p className="text-sm font-mono text-[#94A3B8] mt-1">Manage your account, security, and platform preferences</p>
        </div>
        <GlowButton
          variant="primary"
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
        >
          {saved ? "Saved!" : "Save Changes"}
        </GlowButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar nav */}
        <GlassCard className="col-span-1 p-2 h-fit">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-heading font-medium transition-all text-left ${
                    active
                      ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#00F0FF]" : ""}`} />
                  {label}
                </button>
              );
            })}
          </nav>
        </GlassCard>

        {/* Main content panel */}
        <GlassCard className="col-span-1 lg:col-span-3 p-6">
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "security" && <SecuritySection />}
          {activeSection === "notifications" && <NotificationsSection />}
          {activeSection === "appearance" && <AppearanceSection />}
          {activeSection === "data" && <DataSection />}
          {activeSection === "api" && <ApiSection />}
        </GlassCard>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-white/5 pb-4 mb-6">
      <h2 className="font-heading font-bold text-lg text-white">{title}</h2>
      <p className="text-sm font-mono text-[#94A3B8] mt-1">{description}</p>
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start py-4 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm font-heading font-medium text-white">{label}</div>
        {hint && <div className="text-xs font-mono text-[#475569] mt-0.5">{hint}</div>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function ProfileSection() {
  return (
    <>
      <SectionHeader title="Profile" description="Your public identity within the command center" />
      <FieldRow label="Display Name" hint="Shown in the sidebar and audit logs">
        <input className="input" defaultValue="Operator" />
      </FieldRow>
      <FieldRow label="Email Address" hint="Used for alerts and authentication">
        <input className="input" type="email" defaultValue="operator@command.hq" />
      </FieldRow>
      <FieldRow label="Organization" hint="Cannot be changed after creation">
        <input className="input opacity-50 cursor-not-allowed" defaultValue="Command HQ" disabled />
      </FieldRow>
    </>
  );
}

function SecuritySection() {
  return (
    <>
      <SectionHeader title="Security" description="Manage your authentication and access credentials" />
      <FieldRow label="Current Password" hint="Required to set a new passphrase">
        <input className="input font-mono tracking-widest" type="password" placeholder="••••••••••••" />
      </FieldRow>
      <FieldRow label="New Password" hint="Minimum 8 characters">
        <input className="input font-mono tracking-widest" type="password" placeholder="••••••••••••" />
      </FieldRow>
      <FieldRow label="Confirm Password">
        <input className="input font-mono tracking-widest" type="password" placeholder="••••••••••••" />
      </FieldRow>
      <FieldRow label="Two-Factor Auth" hint="Adds a second layer of security">
        <div className="flex items-center gap-3 p-3 bg-black/30 border border-white/5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[#475569]" />
          <span className="text-sm font-mono text-[#475569]">Not configured</span>
          <button className="ml-auto text-xs font-mono text-[#00F0FF] hover:text-[#2CEFFF] transition-colors">Enable →</button>
        </div>
      </FieldRow>
    </>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    alertEmail: true,
    alertThreshold: true,
    weeklySummary: false,
    anomalyDetect: true,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  return (
    <>
      <SectionHeader title="Notifications" description="Control how and when you receive system alerts" />
      {([
        ["alertEmail",     "Alert Emails",          "Send email when a budget alert triggers"],
        ["alertThreshold", "Threshold Warnings",    "Notify at 70% of budget threshold"],
        ["anomalyDetect",  "Anomaly Detections",    "Alert when unusual spend spikes are detected"],
        ["weeklySummary",  "Weekly Digest",         "Receive a weekly AI spend summary report"],
      ] as [keyof typeof prefs, string, string][]).map(([key, label, hint]) => (
        <FieldRow key={key} label={label} hint={hint}>
          <button
            onClick={() => toggle(key)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${prefs[key] ? "bg-[#00F0FF]" : "bg-white/10"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${prefs[key] ? "left-7" : "left-1"}`} />
          </button>
        </FieldRow>
      ))}
    </>
  );
}

function AppearanceSection() {
  const [density, setDensity] = useState("comfortable");
  return (
    <>
      <SectionHeader title="Appearance" description="Customize the neural command center interface" />
      <FieldRow label="Theme" hint="Color scheme is fixed to Neural Dark">
        <div className="flex items-center gap-3 p-3 bg-black/30 border border-[#00F0FF]/20 rounded-lg">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#8B5CF6]" />
          <span className="text-sm font-mono text-white">Neural Dark</span>
          <span className="ml-auto text-[10px] font-mono text-[#475569] bg-white/5 px-2 py-0.5 rounded">ACTIVE</span>
        </div>
      </FieldRow>
      <FieldRow label="Data Density" hint="Controls how compact the data tables appear">
        <div className="flex gap-2">
          {["compact", "comfortable", "spacious"].map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono capitalize transition-all ${
                density === d
                  ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]"
                  : "bg-black/30 border-white/10 text-[#94A3B8] hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </FieldRow>
    </>
  );
}

function DataSection() {
  return (
    <>
      <SectionHeader title="Data & Privacy" description="Manage your data retention and privacy settings" />
      <FieldRow label="Data Retention" hint="How long cost records are kept">
        <select className="input appearance-none cursor-pointer">
          <option>90 days</option>
          <option>180 days</option>
          <option selected>1 year</option>
          <option>Forever</option>
        </select>
      </FieldRow>
      <FieldRow label="Export Data" hint="Download all your cost records as CSV">
        <button className="btn btn-secondary text-sm flex items-center gap-2 w-full justify-center">
          <Database className="w-4 h-4" />
          Export All Records
        </button>
      </FieldRow>
      <FieldRow label="Delete Account" hint="Permanently removes all data — irreversible">
        <button className="btn btn-danger text-sm w-full">
          Terminate Account
        </button>
      </FieldRow>
    </>
  );
}

function ApiSection() {
  return (
    <>
      <SectionHeader title="API Keys" description="Manage CostLens API access tokens for integrations" />
      <div className="flex flex-col items-center justify-center py-12 text-center border border-white/5 border-dashed rounded-xl bg-black/20">
        <Key className="w-12 h-12 text-[#475569] mb-4" />
        <h3 className="font-heading font-bold text-white mb-2">No API Keys Configured</h3>
        <p className="text-sm font-mono text-[#94A3B8] max-w-sm mb-6">
          Generate access tokens to integrate CostLens data into your own dashboards and tooling.
        </p>
        <GlowButton variant="outline" icon={<Key className="w-4 h-4" />}>
          Generate API Key
        </GlowButton>
      </div>
    </>
  );
}
