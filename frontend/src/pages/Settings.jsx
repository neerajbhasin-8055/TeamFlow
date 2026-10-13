import { useEffect, useState } from "react";

const STORAGE_KEY = "teamflow-settings";

const defaultSettings = {
  theme: "light",
  accent: "violet",
  density: "comfortable",
  displayName: "",
  emailNotifications: true,
  taskReminders: true,
  projectUpdates: false,
  weeklySummary: true,
  weekStartsOn: "Monday",
  dateFormat: "DD MMM YYYY",
};

const accents = {
  violet: {
    button: "bg-violet-600 hover:bg-violet-700",
    soft: "bg-violet-50 text-violet-700",
    ring: "ring-violet-500",
    dot: "bg-violet-500",
  },
  blue: {
    button: "bg-blue-600 hover:bg-blue-700",
    soft: "bg-blue-50 text-blue-700",
    ring: "ring-blue-500",
    dot: "bg-blue-500",
  },
  emerald: {
    button: "bg-emerald-600 hover:bg-emerald-700",
    soft: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-500",
    dot: "bg-emerald-500",
  },
  rose: {
    button: "bg-rose-600 hover:bg-rose-700",
    soft: "bg-rose-50 text-rose-700",
    ring: "ring-rose-500",
    dot: "bg-rose-500",
  },
};

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultSettings, ...(saved || {}) };
  } catch {
    return { ...defaultSettings };
  }
}

function getInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "TF"
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-violet-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function PreferenceRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function Settings() {
  const [settings, setSettings] = useState(readSettings);
  const [activeSection, setActiveSection] = useState("General");
  const [savedMessage, setSavedMessage] = useState("");
  const [showReset, setShowReset] = useState(false);

  const pagePadding =
  settings.density === "compact" ? "p-3 sm:p-5" : "p-4 sm:p-7";

const cardPadding =
  settings.density === "compact" ? "p-4 sm:p-5" : "p-5 sm:p-6";


  const accent = accents[settings.accent] || accents.violet;
  const isDark = settings.theme === "dark";

  const page = isDark
    ? "min-h-full rounded-2xl bg-slate-950 p-4 text-slate-100 sm:p-7"
    : "min-h-full rounded-2xl bg-slate-50 p-4 text-slate-900 sm:p-7";

  const card = isDark
    ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

  const headingText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const inputStyle = isDark
    ? "w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
    : "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
  document.documentElement.classList.toggle(
    "dark",
    settings.theme === "dark"
  );
}, [settings.theme]);

  function update(key, value) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSavedMessage("");
  }

  function saveSettings(event) {
    event?.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedMessage("Your preferences have been saved on this device.");
    window.setTimeout(() => setSavedMessage(""), 3000);
  }

  function resetSettings() {
    setSettings({ ...defaultSettings });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    setShowReset(false);
    setSavedMessage("Settings have been restored to their defaults.");
  }

  const sections = [
    { name: "General", icon: "◈", detail: "Appearance and display" },
    { name: "Profile", icon: "◎", detail: "Your local display name" },
    { name: "Notifications", icon: "♧", detail: "Your notification preferences" },
    { name: "Regional", icon: "◷", detail: "Dates and calendar" },
    { name: "Data & privacy", icon: "◇", detail: "Local preferences" },
  ];

  return (
    <div className={page}>
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-600">
            <span>TEAMFLOW</span>
            <span className={mutedText}>/</span>
            <span className={mutedText}>PREFERENCES</span>
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${headingText}`}>
            Settings
          </h1>
          <p className={`mt-2 text-sm ${mutedText}`}>
            Make TeamFlow feel like your own workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-xs sm:flex ${isDark ? "bg-slate-900" : "bg-white border border-slate-200"}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Preferences stored locally
          </div>
          <button
            onClick={saveSettings}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${accent.button}`}
          >
            Save preferences
          </button>
        </div>
      </div>

      {savedMessage && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          ✓ {savedMessage}
        </div>
      )}

      {/* Profile banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 p-6 text-white shadow-lg sm:p-7">
        <div className="absolute -right-8 -top-16 h-48 w-48 rounded-full border-[28px] border-white/10" />
        <div className="absolute -bottom-20 right-36 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-xl font-bold backdrop-blur">
            {getInitials(settings.displayName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-violet-100">Your workspace</p>
            <h2 className="mt-1 truncate text-xl font-bold">
              {settings.displayName.trim() || "TeamFlow Member"}
            </h2>
            <p className="mt-1 text-sm text-violet-100">
              Personalise your experience, your way.
            </p>
          </div>
          <div className="ml-auto hidden rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold sm:block">
            ✦ Personal preferences
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[235px_minmax(0,1fr)]">
        {/* Settings navigation */}
        <aside className={`${card} !p-3`}>
          <p className={`px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider ${mutedText}`}>
            Preferences
          </p>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.name}
                type="button"
                onClick={() => setActiveSection(section.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  activeSection === section.name
                    ? `${accent.soft} font-semibold`
                    : `${mutedText} hover:bg-slate-100 hover:text-slate-900`
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-700">
                  {section.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm">{section.name}</span>
                  <span className={`mt-0.5 block text-[11px] font-normal ${mutedText}`}>
                    {section.detail}
                  </span>
                </span>
              </button>
            ))}
          </nav>
          <div className={`mt-4 rounded-xl p-4 ${isDark ? "bg-slate-800" : "bg-violet-50"}`}>
            <p className={`text-sm font-bold ${headingText}`}>A little tip</p>
            <p className={`mt-1 text-xs leading-5 ${mutedText}`}>
              Your choices are saved in this browser and stay available after refresh.
            </p>
          </div>
        </aside>

        {/* Selected section */}
        <div className="min-w-0 space-y-6">
          {activeSection === "General" && (
            <>
              <section className={card}>
                <SectionHeading
                  eyebrow="01 / Appearance"
                  title="Make yourself comfortable"
                  description="Choose how your workspace looks and feels."
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "light", icon: "☀", title: "Light mode", description: "Clean, bright and focused." },
                    { value: "dark", icon: "☾", title: "Dark mode", description: "A darker look for low-light work." },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("theme", option.value)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        settings.theme === option.value
                          ? "border-violet-500 ring-2 ring-violet-100"
                          : isDark
                            ? "border-slate-700 hover:border-slate-500"
                            : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`mb-4 flex h-24 items-center justify-center rounded-xl text-3xl ${
                        option.value === "dark" ? "bg-slate-900 text-violet-300" : "bg-slate-100 text-amber-500"
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${headingText}`}>{option.title}</span>
                        {settings.theme === option.value && (
                          <span className="text-xs font-bold text-violet-600">✓ Selected</span>
                        )}
                      </div>
                      <p className={`mt-1 text-xs ${mutedText}`}>{option.description}</p>
                    </button>
                  ))}
                </div>
                <p className={`mt-3 text-xs ${mutedText}`}>
                  Theme preview currently applies to this Settings page.
                </p>
              </section>

              <section className={card}>
                <SectionHeading
                  eyebrow="02 / Accent colour"
                  title="Choose your accent"
                  description="Pick the colour used for primary actions and highlights."
                />
                <div className="flex flex-wrap gap-3">
                  {Object.entries(accents).map(([name, style]) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={`${name} accent`}
                      onClick={() => update("accent", name)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-3 capitalize transition ${
                        settings.accent === name
                          ? `border-slate-400 ring-2 ${style.ring}`
                          : "border-slate-200"
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-full ${style.dot}`} />
                      <span className={`text-sm font-semibold ${headingText}`}>{name}</span>
                      {settings.accent === name && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </section>

              <section className={card}>
                <SectionHeading
                  eyebrow="03 / Layout"
                  title="Workspace density"
                  description="Choose how much breathing room you want in settings."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "comfortable", title: "Comfortable", description: "More spacing and breathing room." },
                    { value: "compact", title: "Compact", description: "A tighter layout with less spacing." },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => update("density", option.value)}
                      className={`rounded-xl border p-4 text-left ${
                        settings.density === option.value
                          ? "border-violet-500 bg-violet-50"
                          : isDark
                            ? "border-slate-700"
                            : "border-slate-200"
                      }`}
                    >
                      <p className={`text-sm font-bold ${headingText}`}>{option.title}</p>
                      <p className={`mt-1 text-xs ${mutedText}`}>{option.description}</p>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeSection === "Profile" && (
            <section className={card}>
              <SectionHeading
                eyebrow="01 / Personalisation"
                title="Profile preferences"
                description="Choose how your name appears in this Settings preview."
              />
              <form onSubmit={saveSettings} className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold ${accent.soft}`}>
                    {getInitials(settings.displayName)}
                  </div>
                  <div>
                    <p className={`font-semibold ${headingText}`}>
                      {settings.displayName.trim() || "TeamFlow Member"}
                    </p>
                    <p className={`mt-1 text-xs ${mutedText}`}>
                      Avatar initials are generated automatically.
                    </p>
                  </div>
                </div>
                <label className="block">
                  <span className={`mb-2 block text-sm font-semibold ${headingText}`}>Display name</span>
                  <input
                    className={inputStyle}
                    value={settings.displayName}
                    maxLength={60}
                    placeholder="Enter a display name"
                    onChange={(event) => update("displayName", event.target.value)}
                  />
                  <span className={`mt-2 block text-xs ${mutedText}`}>
                    This is a local preference, not your server account name.
                  </span>
                </label>
                <button className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${accent.button}`}>
                  Save profile preferences
                </button>
              </form>
            </section>
          )}

          {activeSection === "Notifications" && (
            <section className={card}>
              <SectionHeading
                eyebrow="02 / Staying in the loop"
                title="Notification preferences"
                description="Select the types of updates you would like to enable in the future."
              />
              <div className="divide-y divide-slate-200">
                <PreferenceRow title="Email notifications" description="Preference for email-based updates." checked={settings.emailNotifications} onChange={(value) => update("emailNotifications", value)} />
                <PreferenceRow title="Task reminders" description="Preference for reminders about upcoming deadlines." checked={settings.taskReminders} onChange={(value) => update("taskReminders", value)} />
                <PreferenceRow title="Project updates" description="Preference for project activity updates." checked={settings.projectUpdates} onChange={(value) => update("projectUpdates", value)} />
                <PreferenceRow title="Weekly summary" description="Preference for a weekly progress summary." checked={settings.weeklySummary} onChange={(value) => update("weeklySummary", value)} />
              </div>
              <p className={`mt-4 rounded-xl p-3 text-xs leading-5 ${isDark ? "bg-slate-800 text-slate-300" : "bg-amber-50 text-amber-800"}`}>
                These switches save your choices only. Sending real notifications requires a notification service and backend support.
              </p>
            </section>
          )}

          {activeSection === "Regional" && (
            <section className={card}>
              <SectionHeading
                eyebrow="03 / Date & time"
                title="Regional preferences"
                description="Choose how dates and the working week should be displayed in this settings area."
              />
              <div className="space-y-5">
                <label className="block">
                  <span className={`mb-2 block text-sm font-semibold ${headingText}`}>Week starts on</span>
                  <select className={inputStyle} value={settings.weekStartsOn} onChange={(event) => update("weekStartsOn", event.target.value)}>
                    <option>Monday</option>
                    <option>Sunday</option>
                  </select>
                </label>
                <label className="block">
                  <span className={`mb-2 block text-sm font-semibold ${headingText}`}>Date format preference</span>
                  <select className={inputStyle} value={settings.dateFormat} onChange={(event) => update("dateFormat", event.target.value)}>
                    <option>DD MMM YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </label>
                <div className={`rounded-xl p-4 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                  <p className={`text-xs font-semibold ${mutedText}`}>Example date preview</p>
                  <p className={`mt-1 text-lg font-bold ${headingText}`}>
                    {settings.dateFormat === "DD/MM/YYYY"
                      ? "13/10/2026"
                      : settings.dateFormat === "MM/DD/YYYY"
                        ? "10/13/2026"
                        : settings.dateFormat === "YYYY-MM-DD"
                          ? "2026-10-13"
                          : "13 Oct 2026"}
                  </p>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    Week begins on {settings.weekStartsOn}.
                  </p>
                </div>
                <p className={`text-xs ${mutedText}`}>
                  These are saved preferences; existing project and task date displays are unchanged.
                </p>
              </div>
            </section>
          )}

          {activeSection === "Data & privacy" && (
            <section className={card}>
              <SectionHeading
                eyebrow="04 / Local storage"
                title="Data & privacy"
                description="Manage the preferences saved by this browser."
              />
              <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${accent.soft}`}>◇</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${headingText}`}>Local preferences</p>
                    <p className={`mt-1 text-xs leading-5 ${mutedText}`}>
                      Theme, accent colour, display name, notification toggles and regional choices are stored in this browser under the TeamFlow settings key.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-red-200 p-4">
                <p className="text-sm font-bold text-red-700">Reset preferences</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Restore the settings above to their default values. Your account, projects, teams and tasks will not be deleted.
                </p>
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="mt-4 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Reset all preferences
                </button>
              </div>
            </section>
          )}

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className={`text-xs ${mutedText}`}>
              Settings are saved automatically on this device.
            </p>
            <button
              type="button"
              onClick={saveSettings}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${accent.button}`}
            >
              Save preferences
            </button>
          </div>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
              !
            </div>
            <h2 id="reset-title" className="mt-4 text-lg font-bold text-slate-900">
              Reset your preferences?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your local display choices and notification preferences will return to their defaults. Your TeamFlow account and project data will remain untouched.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetSettings}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Reset preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;