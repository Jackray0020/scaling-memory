import React, { useState } from 'react';
import { LLMProvider } from '@ai-browsing/core';
import './ProviderSettings.css';

interface ProviderSettingsProps {
  currentProvider: LLMProvider;
  onProviderChange: (provider: LLMProvider) => void;
  onClose: () => void;
}

const ProviderSettings: React.FC<ProviderSettingsProps> = ({
  currentProvider,
  onProviderChange,
  onClose,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(currentProvider);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: localStorage.getItem('apikey_openai') || '',
    claude: localStorage.getItem('apikey_claude') || '',
    gemini: localStorage.getItem('apikey_gemini') || '',
  });
  const [enableMCP, setEnableMCP] = useState(localStorage.getItem('enable_mcp') === 'true');

  const providers: LLMProvider[] = ['local', 'openai', 'claude', 'gemini'];

  const handleSave = () => {
    onProviderChange(selectedProvider);

    // Save API keys
    Object.entries(apiKeys).forEach(([provider, key]) => {
      if (key) {
        localStorage.setItem(`apikey_${provider}`, key);
      }
    });

    localStorage.setItem('enable_mcp', enableMCP.toString());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Provider Settings</h2>

        <div className="settings-section">
          <h3>Select LLM Provider</h3>
          <div className="provider-options">
            {providers.map(provider => (
              <label key={provider} className="provider-option">
                <input
                  type="radio"
                  name="provider"
                  value={provider}
                  checked={selectedProvider === provider}
                  onChange={() => setSelectedProvider(provider)}
                />
                <span className="provider-name">
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </span>
                {provider === 'local' && <span className="badge">Demo</span>}
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>API Keys</h3>
          {(['openai', 'claude', 'gemini'] as const).map(provider => (
            <div key={provider} className="api-key-field">
              <label>{provider.toUpperCase()} API Key:</label>
              <input
                type="password"
                value={apiKeys[provider]}
                onChange={e => setApiKeys(prev => ({
                  ...prev,
                  [provider]: e.target.value,
                }))}
                placeholder={`Enter ${provider} API key`}
              />
            </div>
          ))}
        </div>

        <div className="settings-section">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={enableMCP}
              onChange={() => setEnableMCP(!enableMCP)}
            />
            <span>Enable MCP Augmentation</span>
          </label>
        </div>

        <div className="button-group">
          <button onClick={handleSave} className="save-btn">
            Save Settings
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;
