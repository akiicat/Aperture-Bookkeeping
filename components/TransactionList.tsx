import React, { useMemo, useState } from 'react';
import { Transaction, MonthData, CATEGORIES } from '../types';
import { Icons } from '../constants';
import { 
  format, parseISO, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isToday, getDate 
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface TransactionListProps {
  currentMonth: string;
  data: MonthData | null;
  loading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onRefresh: () => void;
  error?: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const TransactionList: React.FC<TransactionListProps> = ({ 
  currentMonth, 
  data, 
  loading, 
  onPrevMonth, 
  onNextMonth,
  onRefresh,
  error,
  selectedDate,
  onSelectDate
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Calendar Grid Data
  const calendarDays = useMemo(() => {
    const monthStart = parseISO(currentMonth + '-01');
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart); // Default starts on Sunday
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Map transactions to dates for dots
  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    if (data?.transactions) {
      data.transactions.forEach(t => {
        if (!map[t.date]) map[t.date] = [];
        map[t.date].push(t);
      });
    }
    return map;
  }, [data]);

  // Determine which transactions to show in list
  const visibleTransactions = useMemo(() => {
    if (!data?.transactions) return [];
    
    if (viewMode === 'list') {
      return data.transactions;
    } else {
      // Calendar mode: filter by selectedDate
      return data.transactions.filter(t => t.date === selectedDate);
    }
  }, [data, viewMode, selectedDate]);

  // Grouping for List View (Groups by date)
  // Even if filtering for single date, this structure works (just one group)
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = [];
    // Sort descending
    const sorted = [...visibleTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sorted.forEach(t => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === t.date) {
        lastGroup.items.push(t);
      } else {
        groups.push({ date: t.date, items: [t] });
      }
    });
    return groups;
  }, [visibleTransactions]);

  // Calculate summary for the visible view (Day or Month)
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    visibleTransactions.forEach(t => {
      if (t.category === '薪資') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, total: income - expense };
  }, [visibleTransactions]);

  const getDayOfWeek = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE', { locale: zhTW });
    } catch {
      return '';
    }
  };

  const getDayNumber = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'd');
    } catch {
      return '';
    }
  };

  const getCategoryIcon = (catName: string) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    if (cat) {
        return <span className="text-xl leading-none">{cat.icon}</span>;
    }
    return <Icons.Tag className="w-5 h-5 text-white" />;
  };

  const getCategoryColor = (catName: string) => {
     const colors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400', 'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-rose-400'];
     let hash = 0;
     for (let i = 0; i < catName.length; i++) {
        hash = catName.charCodeAt(i) + ((hash << 5) - hash);
     }
     return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header Area */}
      <div className="bg-orange-500 text-white pt-10 pb-2 px-2 shadow-md z-20 sticky top-0">
        <div className="flex justify-between items-center mb-2 px-2">
           <button onClick={onRefresh} className="p-2 active:opacity-50">
             <Icons.Search className="w-6 h-6" />
           </button>
           <div className="flex items-center space-x-2">
             <button onClick={onPrevMonth} className="p-1 hover:bg-orange-600 rounded-full"><Icons.ChevronLeft className="w-6 h-6" /></button>
             <h2 className="text-xl font-bold tracking-wider">{currentMonth.replace('-', '年')}月</h2>
             <button onClick={onNextMonth} className="p-1 hover:bg-orange-600 rounded-full"><Icons.ChevronRight className="w-6 h-6" /></button>
           </div>
           {/* Placeholder for symmetry or another action */}
           <div className="w-10"></div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-2">
           <div className="bg-orange-700/30 p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-100 hover:text-white'}`}
              >
                行事曆
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-100 hover:text-white'}`}
              >
                清單
              </button>
           </div>
        </div>
      </div>

      {/* Calendar View Grid (Only visible in Calendar Mode) */}
      {viewMode === 'calendar' && (
        <div className="bg-white pb-2 shadow-sm z-10">
           {/* Weekday Headers */}
           <div className="grid grid-cols-7 text-center py-2 text-xs text-gray-400 border-b border-gray-100">
              {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
           </div>
           
           {/* Days Grid */}
           <div className="grid grid-cols-7 text-center">
              {calendarDays.map((day, idx) => {
                 const dateStr = format(day, 'yyyy-MM-dd');
                 const isCurrentMonth = isSameMonth(day, parseISO(currentMonth + '-01'));
                 const isSelected = selectedDate === dateStr;
                 const isTodayDate = isToday(day);
                 const dayTransactions = transactionsByDate[dateStr] || [];
                 const hasData = dayTransactions.length > 0;
                 // Simple logic: Green dot if any income, else Red if expenses, else Gray
                 const hasIncome = dayTransactions.some(t => t.category === '薪資');

                 return (
                   <div key={dateStr} className="relative h-14 flex flex-col items-center justify-center" onClick={() => onSelectDate(dateStr)}>
                      <div className={`
                         w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer
                         ${isSelected ? 'bg-orange-500 text-white shadow-md' : ''}
                         ${!isSelected && isTodayDate ? 'bg-orange-100 text-orange-600' : ''}
                         ${!isSelected && !isTodayDate && !isCurrentMonth ? 'text-gray-300' : ''}
                         ${!isSelected && !isTodayDate && isCurrentMonth ? 'text-gray-700' : ''}
                      `}>
                         {getDate(day)}
                      </div>
                      
                      {/* Dots */}
                      {hasData && (
                        <div className="flex space-x-0.5 mt-1">
                          <div className={`w-1 h-1 rounded-full ${hasIncome ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                      )}
                      
                      {/* Today Label (Optional, small) */}
                      {isTodayDate && !isSelected && (
                        <span className="absolute top-1 right-1 text-[8px] text-orange-500 font-bold">今</span>
                      )}
                   </div>
                 );
              })}
           </div>
        </div>
      )}

      {/* Summary Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center text-xs text-gray-500 sticky top-0 z-10">
         <div>收入: <span className="text-green-600 font-medium">${summary.income.toLocaleString()}</span></div>
         <div>支出: <span className="text-red-500 font-medium">${summary.expense.toLocaleString()}</span></div>
         <div>合計: <span className="text-gray-800 font-bold">${summary.total.toLocaleString()}</span></div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 no-scrollbar">
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {error && !loading && (
           <div className="p-8 text-center text-gray-500">
             <p className="mb-2">無法載入資料</p>
             <p className="text-xs text-red-400 mb-4">{error}</p>
             <button onClick={onRefresh} className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm">重試</button>
           </div>
        )}

        {!loading && !error && groupedTransactions.length === 0 && (
           <div className="p-10 text-center text-gray-400 mt-4">
              <p>無記帳紀錄</p>
           </div>
        )}

        {!loading && groupedTransactions.map(group => (
          <div key={group.date} className="bg-white mb-2 shadow-sm border-t border-gray-100 first:border-0">
            {/* Date Header (Only show in List Mode, redundant in Calendar Mode if single day selected, but ok to keep for consistent list look) */}
            {viewMode === 'list' && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-gray-800">{getDayNumber(group.date)}</span>
                  <span className="text-xs">{getDayOfWeek(group.date)}</span>
                </div>
                <div className="text-xs">
                  -${group.items.reduce((sum, t) => sum + (t.category === '薪資' ? 0 : Number(t.amount)), 0).toLocaleString()}
                </div>
              </div>
            )}

            {/* Transactions */}
            <div>
              {group.items.map((t, idx) => (
                <div key={idx} className="flex items-center px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${getCategoryColor(t.category)}`}>
                    {getCategoryIcon(t.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                        <span className="font-bold text-gray-800 truncate text-base">{t.category}</span>
                        <span className={`font-mono font-medium ${t.category === '薪資' ? 'text-green-600' : 'text-gray-900'}`}>
                            {t.category === '薪資' ? '+' : ''}{Number(t.amount).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                        <span className="truncate pr-2">{t.item || t.category}</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 shrink-0">{t.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;