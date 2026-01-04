export interface Transaction {
  date: string;
  category: string;
  amount: number;
  item: string; // This maps to 'note' or 'item' in the script
  user: string;
  currency?: string;
}

export interface MonthData {
  total: number;
  transactions: Transaction[];
}

export interface ApiResponse {
  [key: string]: MonthData; // e.g., "2026-01": { ... }
}

export interface ApiError {
  error: string;
  available_months?: string[];
}

export interface UserSettings {
  scriptUrl: string;
  username: string;
}

export enum AppView {
  LIST = 'LIST',
  ADD = 'ADD',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS'
}

export const CATEGORIES = [
  { id: '飲食', name: '飲食', icon: '🍴', desc: '三餐、零食、飲料、外食費、食材費。' },
  { id: '衣服美容', name: '衣服美容', icon: '👕', desc: '服裝、鞋子、配件、保養品、剪頭髮。' },
  { id: '日常', name: '日常', icon: '🧻', desc: '耗材、衛生紙、塑膠袋、洗衣服。' },
  { id: '居家', name: '居家', icon: '🏠', desc: '房租、水電瓦斯、家具、居家修繕、家電。' },
  { id: '交通', name: '交通', icon: '🚌', desc: '油錢、停車費、大眾運輸、汽車保養、罰單。' },
  { id: '教育', name: '教育', icon: '📚', desc: '學費、書籍、課程、文具。' },
  { id: '醫療保健', name: '醫療保健', icon: '💊', desc: '藥品、看病、體檢。' },
  { id: '電信', name: '電信', icon: '📶', desc: '電話、網路、第四台、合併帳單的國際漫遊。' },
  { id: '其他', name: '其他', icon: '🏷️', desc: '人情往來 (紅包、禮品)、雜項開銷。' },
  { id: '娛樂', name: '娛樂', icon: '🎮', desc: '旅遊、聚餐、電影、運動、娛樂活動。' },
  { id: '數位服務', name: '數位服務', icon: '💻', desc: 'Netflix, Google service, Github, Steam, Paypal。' },
  { id: '稅務', name: '稅務', icon: '🧾', desc: '所得稅、牌照稅、燃料稅、稅金。' },
  { id: '保險費', name: '保險費', icon: '🛡️', desc: '勞保、健保、壽險、保險費、機車強制險。' },
  { id: '手續費', name: '手續費', icon: '💸', desc: '電匯費用、國外交易服務費。' },
  { id: '富宇天雋', name: '富宇天雋', icon: '🏢', desc: '頭期款、房貸、管理費、裝修費。' },
  { id: '薪資', name: '薪資', icon: '💰', desc: '薪水、獎金、股利。' },
];

export const DEFAULT_SCRIPT_URL = "https://script.google.com/a/macros/aperture.day/s/AKfycby_AJf57V8_Cbjuq7Po6u9QDbQjnsDTQXlQPOayDr59zZiNb8hKsRv5_nDKBFLWRV-C/exec";