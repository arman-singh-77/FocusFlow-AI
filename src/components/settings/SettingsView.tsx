import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Key,
  Bot,
  Volume2,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  AppSettings,
  exportDataAsJson,
  importDataFromJson,
} from '../../services/storage';
import { testGeminiConnection } from '../../services/gemini';
import { soundService } from '../../services/sound';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { tasks, loadSampleData, clearAllTasks, importTasks } = useTasks();

  const [settings, setSettings] = useState<AppSettings>(() => loadSettingsFromStorage());
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File input ref for importing
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSaveSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettingsToStorage(updated);
    soundService.setEnabled(updated.soundEnabled);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveGeminiKey = () => {
    handleSaveSettings({
      geminiApiKey: apiKeyInput.trim(),
      useGemini: !!apiKeyInput.trim() && settings.useGemini,
    });
  };

  const handleTestGemini = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);

    const res = await testGeminiConnection(apiKeyInput.trim(), settings.geminiModel);
    setTestingConnection(false);
    setTestResult(res);

    if (res.success) {
      handleSaveSettings({
        geminiApiKey: apiKeyInput.trim(),
        useGemini: true,
      });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const res = importDataFromJson(content);
        if (res.success && res.tasks) {
          importTasks(res.tasks);
          alert(`Successfully imported ${res.tasks.length} tasks!`);
        } else {
          alert(res.error || 'Failed to import tasks.');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {saveSuccess && (
        <div className="p-3 rounded-2xl bg-mint-100 text-forest-800 dark:bg-forest-950 dark:text-mint-300 border border-mint-300 dark:border-forest-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-forest-600 dark:text-mint-400" />
          <span>Preferences saved successfully!</span>
        </div>
      )}
      {/* 1. Theme Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft space-y-5">
        <div>
          <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">
            Appearance & Theme
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Choose your preferred color theme. Your selection is automatically saved in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'border-forest-700 dark:border-mint-400 bg-mint-50/80 dark:bg-forest-950/60 shadow-soft'
                : 'border-cream-300 dark:border-charcoal-800 hover:bg-cream-200/50 dark:hover:bg-charcoal-800'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-forest-950 dark:text-cream-50 block">
                Warm Cream (Light)
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Calm daylight aesthetic</span>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-forest-700 dark:border-mint-400 bg-mint-50/80 dark:bg-forest-950/60 shadow-soft'
                : 'border-cream-300 dark:border-charcoal-800 hover:bg-cream-200/50 dark:hover:bg-charcoal-800'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-charcoal-800 text-mint-300 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-forest-950 dark:text-cream-50 block">
                Deep Charcoal (Dark)
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Night flow with mint accents</span>
            </div>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
              theme === 'system'
                ? 'border-forest-700 dark:border-mint-400 bg-mint-50/80 dark:bg-forest-950/60 shadow-soft'
                : 'border-cream-300 dark:border-charcoal-800 hover:bg-cream-200/50 dark:hover:bg-charcoal-800'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-charcoal-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-forest-950 dark:text-cream-50 block">
                System Default
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Syncs with OS mode</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Gemini AI Integration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-forest-700 dark:text-mint-400" />
              <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">
                AI Assistant Engine
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              FocusFlow AI works 100% offline out-of-the-box with a built-in deterministic NLP engine. You can optionally connect a Gemini API key for freeform conversational assistance.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-mint-100 dark:bg-forest-950 text-forest-800 dark:text-mint-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-forest-600 dark:bg-mint-400" />
            <span>
              {settings.useGemini && settings.geminiApiKey ? 'Gemini AI Active' : 'Deterministic Rule Engine Active'}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Gemini API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Google Gemini API Key <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={e => {
                    setApiKeyInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="AIzaSy..."
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600/40 text-stone-900 dark:text-cream-50 placeholder:text-stone-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveGeminiKey}
                disabled={!apiKeyInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 disabled:opacity-40 text-stone-800 dark:text-cream-100 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingConnection || !apiKeyInput.trim()}
                className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-cream-50 text-xs font-semibold transition"
              >
                {testingConnection ? 'Testing...' : 'Test & Connect'}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
              🔒 Privacy Guarantee: Your key is stored solely in your local browser storage. It is never logged or transmitted to any third-party backend.
            </p>
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResult.success
                  ? 'bg-mint-100 text-forest-800 dark:bg-forest-950 dark:text-mint-300 border-mint-300 dark:border-forest-800'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-900'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-forest-700 dark:text-mint-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Model selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Gemini Model
              </label>
              <select
                value={settings.geminiModel}
                onChange={e => handleSaveSettings({ geminiModel: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-cream-100/70 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl text-stone-800 dark:text-cream-50 focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast & Free tier)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100/50 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700">
              <div>
                <span className="text-xs font-semibold text-stone-800 dark:text-cream-100 block">
                  Enable Gemini Mode
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Fallback to rule engine if disabled
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.useGemini && !!settings.geminiApiKey}
                disabled={!settings.geminiApiKey}
                onChange={e => handleSaveSettings({ useGemini: e.target.checked })}
                className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Audio & Notifications */}
      <div className="p-6 sm:p-8 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-forest-700 dark:text-mint-400" />
            <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">
              Sound Chimes
            </h3>
          </div>

          <button
            onClick={() => soundService.playTimerFinish()}
            className="text-xs font-semibold text-forest-700 dark:text-mint-400 hover:underline"
          >
            Test Chime
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-100/60 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700">
          <div>
            <span className="text-sm font-semibold text-stone-800 dark:text-cream-100 block">
              Audio Feedback
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Play calming acoustic chime upon task completion & focus interval finish
            </span>
          </div>

          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={e => handleSaveSettings({ soundEnabled: e.target.checked })}
            className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Local Data Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-cream-50 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-800 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-forest-700 dark:text-mint-400" />
          <h3 className="text-lg font-bold text-forest-950 dark:text-cream-50">
            Data Storage & Backup
          </h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          All your tasks and statistics are stored locally in your browser's persistent LocalStorage. You can export a JSON backup at any time or reload sample tasks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => exportDataAsJson(tasks)}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-cream-200/70 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-stone-800 dark:text-cream-100 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-cream-200/70 hover:bg-cream-300 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-stone-800 dark:text-cream-100 text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          <button
            onClick={loadSampleData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-mint-100 hover:bg-mint-200 dark:bg-forest-950 dark:hover:bg-forest-900 text-forest-900 dark:text-mint-300 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
                clearAllTasks();
              }
            }}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
