import React, { useState, useEffect } from 'react';
import { CATEGORIES, UserSettings } from '../types';
import { Icons } from '../constants';
import { saveTransaction } from '../services/api';
import { format } from 'date-fns';

interface AddTransactionProps {
  onClose: () => void;
  onSuccess: () => void;
  settings: UserSettings;
  initialDate: string;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onClose, onSuccess, settings, initialDate }) => {
  const [amountStr, setAmountStr] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState(initialDate);

  // Keypad Logic
  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === '+' || key === '-') {
      // Simple evaluation if previous operation exists
      // For simplicity in this demo, we just allow digits. 
      // If we want calculation, we'd need eval or custom parser.
      // Let's stick to simple number input for now as per prompt "keypad". 
      // Screenshot shows math symbols, so let's allow adding them to string but handle eval on submit? 
      // Safer: Just allow one number. Re-reading: Image has + and -. 
      // Let's implement basic expression builder but prevent invalid multiple operators.
      setAmountStr(prev => {
         const lastChar = prev.slice(-1);
         if (['+','-', '.'].includes(lastChar)) return prev; // Don't double operators
         return prev + key;
      });
    } else if (key === '.') {
      setAmountStr(prev => {
         // Allow one dot per number segment
         const parts = prev.split(/[\+\-]/);
         const currentPart = parts[parts.length - 1];
         if (currentPart.includes('.')) return prev;
         return prev + key;
      });
    } else if (key === 'check') {
      handleSubmit();
    } else {
      // Digit
      setAmountStr(prev => prev === '0' ? key : prev + key);
    }
  };

  const calculateTotal = (expression: string): number => {
      try {
          // Dangerous eval replacement for simple math
          // Only allow digits, +, -, .
          if (!/^[0-9\+\-\.]+$/.test(expression)) return 0;
          // eslint-disable-next-line no-new-func
          const result = new Function(`return ${expression}`)();
          return parseFloat(result);
      } catch {
          return 0;
      }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const finalAmount = calculateTotal(amountStr);
    if (finalAmount <= 0) {
        alert('金額必須大於 0');
        return;
    }

    setIsSubmitting(true);
    
    const transaction = {
        date: date,
        category: selectedCategory.name,
        amount: finalAmount,
        currency: 'TWD',
        note: note || selectedCategory.name, // maps to 'item'/'note'
        user: settings.username
    };
    
    // Optimistic UI updates could happen here, but we'll wait for API
    const result = await saveTransaction(settings.scriptUrl, transaction);
    
    setIsSubmitting(false);
    if (result.success) {
        onSuccess();
    } else {
        alert(`儲存失敗: ${result.message}`);
    }
  };

  const KeyPadButton = ({ val, display, className, onClick }: any) => (
      <button 
        onClick={() => onClick ? onClick() : handleKeyPress(val)}
        className={`flex items-center justify-center text-xl font-medium active:bg-gray-700 transition-colors ${className || 'bg-gray-900 text-white'}`}
      >
          {display || val}
      </button>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-full animate-fade-in-up">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
        <button onClick={onClose} className="p-2 text-gray-500">
            <Icons.X className="w-6 h-6" />
        </button>
        <div className="bg-gray-200 rounded-full px-4 py-1 text-sm font-medium text-gray-600 flex items-center">
             <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="bg-transparent border-none outline-none text-center w-28"
             />
        </div>
        <div className="text-3xl font-bold text-gray-800 font-mono tracking-tight">
           ${amountStr}
        </div>
      </div>

      {/* Category Description Banner */}
      <div className="bg-orange-50 px-4 py-2 text-xs text-orange-700 text-center border-b border-orange-100">
          {selectedCategory.desc}
      </div>

      {/* Category Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="grid grid-cols-5 gap-4">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex flex-col items-center gap-2"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedCategory.id === cat.id ? 'bg-orange-500 text-white shadow-lg scale-110' : 'bg-white text-gray-800 shadow-sm'}`}>
                        <span className="text-2xl leading-none">{cat.icon}</span>
                    </div>
                    <span className={`text-xs ${selectedCategory.id === cat.id ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                        {cat.name}
                    </span>
                </button>
            ))}
        </div>
      </div>

      {/* Note Input Area */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <Icons.Tag className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder={`${selectedCategory.name} (點選以編輯註記)`}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-300"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
      </div>

      {/* Quick Tags (Mock) */}
      <div className="flex overflow-x-auto gap-2 px-4 py-2 bg-gray-50 no-scrollbar">
          {['早餐', '午餐', '晚餐', '飲料', '日用品'].map(tag => (
              <button key={tag} onClick={() => setNote(tag)} className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 border border-gray-200 whitespace-nowrap">
                  {tag}
              </button>
          ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 h-64 bg-gray-900 text-white">
          <KeyPadButton val="7" />
          <KeyPadButton val="8" />
          <KeyPadButton val="9" />
          <KeyPadButton val="backspace" display={<Icons.Delete className="w-6 h-6 text-orange-400" />} />
          
          <KeyPadButton val="4" />
          <KeyPadButton val="5" />
          <KeyPadButton val="6" />
          <KeyPadButton val="+" display={<Icons.Plus className="w-6 h-6 text-orange-400" />} />
          
          <KeyPadButton val="1" />
          <KeyPadButton val="2" />
          <KeyPadButton val="3" />
          <KeyPadButton val="-" className="text-orange-400 text-3xl pb-1" />
          
          <div className="flex items-center justify-center text-xs text-gray-400">TWD</div>
          <KeyPadButton val="0" />
          <KeyPadButton val="." />
          <KeyPadButton val="check" 
              onClick={handleSubmit} 
              className="bg-orange-500 hover:bg-orange-600" 
              display={isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Icons.Check className="w-6 h-6" />} 
          />
      </div>
    </div>
  );
};

export default AddTransaction;
