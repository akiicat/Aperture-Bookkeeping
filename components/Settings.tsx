import React, { useState } from 'react';
import { UserSettings, DEFAULT_SCRIPT_URL } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [url, setUrl] = useState(settings.scriptUrl);
  const [username, setUsername] = useState(settings.username);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave({ scriptUrl: url, username: username });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const resetDefaultUrl = () => {
      setUrl(DEFAULT_SCRIPT_URL);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 pt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">使用者名稱 (記帳人)</label>
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="例如: Annie, Aki"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
        />
        <p className="text-xs text-gray-400 mt-2">此名稱將會記錄在每一筆帳目中，只需設定一次。</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Google Script URL</label>
            <button onClick={resetDefaultUrl} className="text-xs text-orange-500">重設預設值</button>
        </div>
        <textarea 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://script.google.com/..."
          className="w-full p-3 border border-gray-300 rounded-lg h-32 text-xs focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all break-all"
        />
        <p className="text-xs text-gray-400 mt-2">請貼上部署為 Web App 的 Apps Script 網址。</p>
      </div>

      <button 
        onClick={handleSave}
        disabled={!username}
        className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition-all ${!username ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 active:scale-95 hover:bg-orange-600'}`}
      >
        {isSaved ? '已儲存！' : '儲存設定'}
      </button>

      {!username && (
         <p className="text-red-500 text-sm text-center mt-4">請先設定使用者名稱以開始記帳。</p>
      )}
    </div>
  );
};

export default Settings;
