import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, parseISO, isSameMonth } from 'date-fns';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import Settings from './components/Settings';
import Stats from './components/Stats';
import { Icons } from './constants';
import { fetchTransactions } from './services/api';
import { UserSettings, AppView, MonthData, DEFAULT_SCRIPT_URL, ApiResponse } from './types';

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<AppView>(AppView.LIST);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  
  // Selected Date State (Lifted from TransactionList)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Settings State with LocalStorage persistence
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('aperture_settings');
    return saved ? JSON.parse(saved) : { scriptUrl: DEFAULT_SCRIPT_URL, username: '' };
  });

  // Save settings when changed
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('aperture_settings', JSON.stringify(newSettings));
  };

  // Redirect to settings if no username
  useEffect(() => {
    if (!settings.username) {
      setCurrentView(AppView.SETTINGS);
    }
  }, [settings.username]);

  // Sync selectedDate with currentMonth
  useEffect(() => {
    const monthStart = parseISO(currentMonth + '-01');
    const now = new Date();
    // If current month matches today's month, select today, else select 1st
    if (isSameMonth(now, monthStart)) {
      setSelectedDate(format(now, 'yyyy-MM-dd'));
    } else {
      setSelectedDate(format(monthStart, 'yyyy-MM-dd'));
    }
  }, [currentMonth]);

  // Fetch Data
  const loadData = async () => {
    console.log(settings)
    if (!settings.username) return; // Don't fetch if setup incomplete
    
    setLoading(true);
    setError(undefined);
    try {
      // Pass settings.username to filter by user
      const result = await fetchTransactions(settings.scriptUrl, currentMonth, settings.username);
      
      // Check for error property safely. 
      // ApiResponse has an index signature which makes direct access ambiguous in union, so we check type.
      // We assume if .error is a string, it's an ApiError.
      const resultAny = result as any;
      
      if (typeof resultAny.error === 'string') {
        // If "Month not found", treat as empty data
        if (resultAny.error === 'Month not found') {
            setMonthData({ total: 0, transactions: [] });
        } else {
            setError(resultAny.error);
        }
      } else {
        // Cast to ApiResponse to access by index
        const data = (result as ApiResponse)[currentMonth];
        setMonthData(data || { total: 0, transactions: [] });
      }
    } catch (err) {
      setError('Connection Failed');
    } finally {
      setLoading(false);
    }
  };

  // Reload when month or settings change
  useEffect(() => {
    if (currentView === AppView.LIST || currentView === AppView.STATS) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentView, settings.scriptUrl, settings.username]); // Refetch when month, view, api url, or username changes

  // Month Navigation
  const handlePrevMonth = () => {
    const date = new Date(currentMonth + '-01');
    setCurrentMonth(format(subMonths(date, 1), 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const date = new Date(currentMonth + '-01');
    setCurrentMonth(format(addMonths(date, 1), 'yyyy-MM'));
  };

  // Navigation Bar Component
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center pb-[env(safe-area-inset-bottom)] pt-2 px-2 z-40 h-[80px]">
      <NavButton view={AppView.LIST} icon="Calendar" label="帳本" />
      <NavButton view={AppView.STATS} icon="PieChart" label="分析" />
      
      {/* Center FAB */}
      <div className="relative -top-6">
        <button 
          onClick={() => setCurrentView(AppView.ADD)}
          className="bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Icons.Plus className="w-8 h-8" />
        </button>
      </div>

      <div className="flex-1"></div> {/* Spacer for symmetry if needed, or just standard flex */}
      
      <NavButton view={AppView.SETTINGS} icon="Settings" label="設定" />
    </div>
  );

  const NavButton = ({ view, icon, label }: { view: AppView, icon: string, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => setCurrentView(view)}
        className={`flex flex-col items-center justify-center w-16 space-y-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}
      >
        {React.createElement(Icons[icon], { className: "w-6 h-6" })}
        <span className="text-[10px]">{label}</span>
      </button>
    );
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === AppView.LIST && (
          <TransactionList 
            currentMonth={currentMonth}
            data={monthData}
            loading={loading}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onRefresh={loadData}
            error={error}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
        
        {currentView === AppView.STATS && (
          <Stats data={monthData} />
        )}

        {currentView === AppView.SETTINGS && (
          <Settings settings={settings} onSave={handleSaveSettings} />
        )}
      </div>

      {/* Add Transaction Modal Overlay */}
      {currentView === AppView.ADD && (
        <AddTransaction 
          onClose={() => setCurrentView(AppView.LIST)} 
          onSuccess={() => {
            setCurrentView(AppView.LIST);
            loadData();
          }}
          settings={settings}
          initialDate={selectedDate}
        />
      )}

      {/* Bottom Navigation (Only visible on main views) */}
      {currentView !== AppView.ADD && <BottomNav />}
    </div>
  );
};

export default App;