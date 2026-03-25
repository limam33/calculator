import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ArrowLeftRight, 
  Settings2, 
  Info,
  History,
  Trash2,
  Copy,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  DollarSign,
  Percent,
  Calendar,
  Plus,
  Minus
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as math from 'mathjs';
import { translations } from './translations';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Context & Types ---
type Language = 'ar' | 'en' | 'fr';
type Theme = 'light' | 'dark';
type Tab = 'compound' | 'engineering' | 'units' | 'currency';

const AppContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  t: any;
}>({
  lang: 'ar',
  setLang: () => {},
  theme: 'light',
  setTheme: () => {},
  t: translations.ar
});

// --- Components ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "rounded-3xl transition-all duration-500 overflow-hidden",
    "bg-white border border-blue-100 shadow-xl shadow-blue-900/5",
    "dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none dark:backdrop-blur-sm",
    className
  )}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "number", suffix, prefix, className }: any) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className="relative group">
      {prefix && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600/60 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          {prefix}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-5 py-3.5 bg-blue-50/30 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700/50 rounded-2xl focus:ring-8 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-right dark:text-white font-bold text-lg shadow-sm placeholder:text-blue-300 text-blue-900",
          prefix && "pl-12",
          suffix && "pr-12"
        )}
        dir="ltr"
      />
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600/60 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const SearchableSelect = ({ label, value, onChange, options, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { theme, t } = useContext(AppContext);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const s = search.toLowerCase();
    return options.filter((o: any) => 
      o.code.toLowerCase().startsWith(s) || 
      o.name.toLowerCase().includes(s) ||
      (t.currencies[o.code] && t.currencies[o.code].toLowerCase().includes(s))
    );
  }, [search, options, t]);

  const selectedOption = options.find((o: any) => o.code === value);

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-3.5 bg-blue-50/30 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm",
          isOpen ? "ring-8 ring-blue-500/10 border-blue-600" : "hover:border-blue-400"
        )}
      >
        <span className="font-bold dark:text-white text-blue-900">
          {selectedOption ? `${t.currencies[selectedOption.code] || selectedOption.name} (${selectedOption.code})` : placeholder}
        </span>
        <ChevronDown size={18} className={cn("text-blue-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-3xl shadow-2xl z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 border-b border-blue-50 dark:border-slate-800">
              <input 
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search || "Search..."}
                className="w-full px-4 py-2.5 bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl outline-none text-sm dark:text-white focus:border-blue-600 transition-all"
              />
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((o: any) => (
                  <div 
                    key={o.code}
                    onClick={() => {
                      onChange(o.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800",
                      value === o.code ? "bg-blue-600 text-white font-bold" : "text-blue-900 dark:text-slate-400"
                    )}
                  >
                    <span className="text-sm">
                      {t.currencies[o.code] || o.name}
                    </span>
                    <span className="text-[10px] font-black opacity-60 tracking-wider">{o.code}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-blue-400 text-sm italic">
                  {t.noResults || "No results found"}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('app-lang');
    return (saved as Language) || 'ar';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'light';
  });
  const [activeTab, setActiveTab] = useState<Tab>('compound');

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, t }}>
      <div className={cn("min-h-screen transition-all duration-500", theme === 'dark' ? "bg-slate-950 text-slate-100" : "bg-blue-50/30 text-slate-900")}>
        {/* Header */}
        <header className="bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border-b border-blue-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Calculator size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 hidden sm:block tracking-tight">
                  {t.title}
                </h1>
                <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-[0.2em] hidden sm:block">Professional Tools</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center gap-2 bg-blue-50/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-blue-100 dark:border-slate-800">
              <TabButton active={activeTab === 'compound'} onClick={() => setActiveTab('compound')} icon={<TrendingUp size={18} />} label={t.compound} />
              <TabButton active={activeTab === 'engineering'} onClick={() => setActiveTab('engineering')} icon={<Calculator size={18} />} label={t.engineering} />
              <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<ArrowLeftRight size={18} />} label={t.units} />
              <TabButton active={activeTab === 'currency'} onClick={() => setActiveTab('currency')} icon={<DollarSign size={18} />} label={t.currency} />
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-blue-900 dark:text-slate-400 border border-blue-100 dark:border-slate-800 shadow-sm font-bold">
                  <Globe size={18} className="text-blue-600" />
                  <span className="text-sm uppercase tracking-wider">{lang}</span>
                </button>
                <div className="absolute top-full right-0 mt-3 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] min-w-[160px] p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {(['ar', 'en', 'fr'] as const).map(l => (
                    <button 
                      key={l} 
                      onClick={() => setLang(l)} 
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between mb-1 last:mb-0", 
                        lang === l 
                          ? "bg-blue-600 text-white font-bold" 
                          : "text-blue-900 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <span>{l === 'ar' ? 'العربية' : l === 'en' ? 'English' : 'Français'}</span>
                      {lang === l && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all border shadow-sm hover:shadow-md active:scale-95",
                  theme === 'light' 
                    ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" 
                    : "bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700"
                )}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 pb-32 md:pb-8">
          {activeTab === 'compound' && <CompoundCalculator />}
          {activeTab === 'engineering' && <EngineeringCalculator />}
          {activeTab === 'units' && <UnitConverter />}
          {activeTab === 'currency' && <CurrencyConverter />}
        </main>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
          <nav className="bg-white dark:bg-slate-900/80 backdrop-blur-lg border border-blue-100 dark:border-slate-800 p-2 rounded-2xl shadow-2xl flex justify-around items-center">
            <MobileTabButton active={activeTab === 'compound'} onClick={() => setActiveTab('compound')} icon={<TrendingUp size={22} />} label={t.compound} />
            <MobileTabButton active={activeTab === 'engineering'} onClick={() => setActiveTab('engineering')} icon={<Calculator size={22} />} label={t.engineering} />
            <MobileTabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<ArrowLeftRight size={22} />} label={t.units} />
            <MobileTabButton active={activeTab === 'currency'} onClick={() => setActiveTab('currency')} icon={<DollarSign size={22} />} label={t.currency} />
          </nav>
        </div>
      </div>
    </AppContext.Provider>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative group",
        active 
          ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-md border border-blue-100 dark:border-slate-600" 
          : "text-blue-900/40 dark:text-slate-400 hover:text-blue-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50"
      )}
    >
      <span className={cn("transition-transform duration-300", active && "scale-110")}>{icon}</span>
      <span>{label}</span>
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-700 dark:bg-blue-400" />
      )}
    </button>
  );
}

function MobileTabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-300",
        active ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10" : "text-blue-900/40 dark:text-slate-500 hover:text-blue-900"
      )}
    >
      <div className={cn(
        "transition-all duration-300",
        active ? "scale-110" : "scale-100"
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

// --- Compound Interest Calculator ---
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'ب.د', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial' },
  {code: 'BTC', symbol: '₿', name: 'Bitcoin' },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum' },
  { code: 'SOL', symbol: 'S', name: 'Solana' },
  { code: 'BNB', symbol: 'BNB', name: 'Binance Coin' },
  { code: 'XRP', symbol: 'XRP', name: 'Ripple' },
  { code: 'ADA', symbol: '₳', name: 'Cardano' },
  { code: 'DOGE', symbol: 'Ð', name: 'Dogecoin' },
  { code: 'DOT', symbol: '●', name: 'Polkadot' },
  { code: 'TRX', symbol: 'TRX', name: 'TRON' },
  { code: 'LTC', symbol: 'Ł', name: 'Litecoin' },
  { code: 'LINK', symbol: '🔗', name: 'Chainlink' },
  { code: 'MATIC', symbol: 'M', name: 'Polygon' },
  { code: 'SHIB', symbol: '🐕', name: 'Shiba Inu' },
  { code: 'DAI', symbol: '◈', name: 'Dai' },
  { code: 'USDT', symbol: '₮', name: 'Tether' },
  { code: 'USDC', symbol: 'U', name: 'USD Coin' },
  { code: 'AVAX', symbol: 'A', name: 'Avalanche' },
  { code: 'UNI', symbol: 'U', name: 'Uniswap' },
  { code: 'ATOM', symbol: 'A', name: 'Cosmos' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'PYG', symbol: 'Gs', name: 'Paraguayan Guarani' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya' },
];

function CompoundCalculator() {
  const { t, lang, theme } = useContext(AppContext);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [principal, setPrincipal] = useState(5000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);
  const [months, setMonths] = useState(0);
  const [frequency, setFrequency] = useState(12); // Monthly
  const [contribution, setContribution] = useState(0);
  const [contributionFreq, setContributionFreq] = useState(12);
  const [contributionType, setContributionType] = useState<'none' | 'deposit' | 'withdrawal'>('none');
  const [annualIncrease, setAnnualIncrease] = useState(0);
  const [view, setView] = useState<'table' | 'chart' | 'summary'>('table');

  const results = useMemo(() => {
    const totalMonths = years * 12 + months;
    const data = [];
    let balance = principal;
    let totalInterest = 0;
    let totalContributions = 0;
    let currentContribution = contribution;

    data.push({ year: 0, month: 0, balance, interest: 0, accruedInterest: 0, contributions: 0 });

    const monthlyRate = rate / 100 / 12;
    const compoundStep = 12 / frequency;

    for (let m = 1; m <= totalMonths; m++) {
      // Annual increase in contribution
      if (m > 1 && m % 12 === 1) {
        currentContribution *= (1 + annualIncrease / 100);
      }

      // Contribution
      let monthlyContribution = 0;
      if (contributionType !== 'none') {
        if (m % (12 / contributionFreq) === 0) {
          monthlyContribution = contributionType === 'deposit' ? currentContribution : -currentContribution;
        }
      }

      // Add contribution first (standard for many calculators)
      balance += monthlyContribution;
      totalContributions += monthlyContribution;

      // Interest calculation based on frequency
      let interest = 0;
      if (m % compoundStep === 0) {
        // Compound interest applied at the end of the compounding period
        // For simplicity in a monthly loop, we calculate interest on the balance
        // that has been accumulating.
        const periodicRate = (rate / 100) / frequency;
        interest = balance * periodicRate;
        balance += interest;
        totalInterest += interest;
      }

      if (m % 12 === 0 || m === totalMonths) {
        data.push({
          year: Math.ceil(m / 12),
          month: m,
          balance: Math.max(0, balance),
          interest,
          accruedInterest: totalInterest,
          contributions: totalContributions
        });
      }
    }
    return data;
  }, [principal, rate, years, months, frequency, contribution, contributionFreq, contributionType, annualIncrease]);

  const final = results[results.length - 1];
  const totalInvested = principal + final.contributions;
  const ror = ((final.balance - totalInvested) / totalInvested) * 100;
  const compoundedRate = (Math.pow(final.balance / principal, 1 / (years + months / 12)) - 1) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> {t.compound}
          </h2>
          <div className="space-y-6">
            <SearchableSelect 
              label={t.currency}
              value={currency.code}
              onChange={(code: string) => setCurrency(CURRENCIES.find(c => c.code === code) || CURRENCIES[0])}
              options={CURRENCIES}
            />

            <div className="grid grid-cols-1 gap-6">
              <Input label={t.initialInvestment} value={principal} onChange={(v: any) => setPrincipal(Number(v))} prefix={currency.symbol} />
              
              <div className="space-y-4 pt-4 border-t border-blue-50 dark:border-slate-800">
                <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{t.contributions}</label>
                <div className="flex bg-blue-50/50 dark:bg-slate-800 p-1.5 rounded-2xl border border-blue-100/50 dark:border-slate-700/30">
                  {(['none', 'deposit', 'withdrawal'] as const).map(type => (
                    <button 
                      key={type} 
                      onClick={() => setContributionType(type)} 
                      className={cn(
                        "flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all", 
                        contributionType === type 
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                          : "text-blue-900/40 dark:text-slate-500 hover:text-blue-900 dark:hover:text-slate-400"
                      )}
                    >
                      {t[type]}
                    </button>
                  ))}
                </div>

                {contributionType !== 'none' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label={t.amount} value={contribution} onChange={(v: any) => setContribution(Number(v))} prefix={currency.symbol} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{t.contributionFrequency}</label>
                        <select 
                          value={contributionFreq} 
                          onChange={(e) => setContributionFreq(Number(e.target.value))} 
                          className="w-full px-4 py-3 bg-blue-50/30 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700/50 rounded-2xl dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-blue-900"
                        >
                          <option value={12}>{t.monthly}</option>
                          <option value={4}>{t.every3Months}</option>
                          <option value={1}>{t.annual}</option>
                        </select>
                      </div>
                    </div>
                    <Input label={t.annualIncrease} value={annualIncrease} onChange={(v: any) => setAnnualIncrease(Number(v))} suffix="%" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-50 dark:border-slate-800">
              <Input label={t.interestRate} value={rate} onChange={(v: any) => setRate(Number(v))} suffix="%" />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{t.compoundFrequency}</label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(Number(e.target.value))} 
                  className="w-full px-4 py-3 bg-blue-50/30 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700/50 rounded-2xl dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-blue-900"
                >
                  <option value={12}>{t.monthly}</option>
                  <option value={4}>{t.every3Months}</option>
                  <option value={1}>{t.annual}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label={t.years} value={years} onChange={(v: any) => setYears(Number(v))} />
              <Input label={t.months} value={months} onChange={(v: any) => setMonths(Number(v))} />
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultCard title={t.futureValue} value={final.balance} color="text-emerald-500" symbol={currency.symbol} />
          <ResultCard title={t.totalInterest} value={final.accruedInterest} color="text-orange-500" symbol={currency.symbol} />
          <ResultCard title={t.initialBalance} value={principal} color="text-blue-500" symbol={currency.symbol} />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold dark:text-white text-blue-900">{t.breakdown}</h2>
            <div className="flex bg-blue-50/50 dark:bg-slate-800 p-1 rounded-2xl">
              {(['table', 'chart', 'summary'] as const).map(v => (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={cn(
                    "px-6 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all", 
                    view === v 
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-blue-900/40 dark:text-slate-500 hover:text-blue-900 dark:hover:text-slate-400"
                  )}
                >
                  {t[v]}
                </button>
              ))}
            </div>
          </div>

          {view === 'chart' && (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#dbeafe'} />
                  <XAxis 
                    dataKey="year" 
                    stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#64748b' : '#94a3b8'} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `${currency.symbol}${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#1e293b' : '#dbeafe',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: theme === 'dark' ? '#f8fafc' : '#1e3a8a'
                    }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" name={t.balance} />
                  <Area type="monotone" dataKey="contributions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" name={t.contributions} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {view === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-blue-100 dark:border-slate-800">
                    <th className="py-3 px-4 text-xs font-black text-blue-900/40 dark:text-slate-400 uppercase tracking-wider">{t.year}</th>
                    <th className="py-3 px-4 text-xs font-black text-blue-900/40 dark:text-slate-400 uppercase tracking-wider">{t.interest}</th>
                    <th className="py-3 px-4 text-xs font-black text-blue-900/40 dark:text-slate-400 uppercase tracking-wider">{t.accruedInterest}</th>
                    <th className="py-3 px-4 text-xs font-black text-blue-900/40 dark:text-slate-400 uppercase tracking-wider">{t.balance}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 dark:divide-slate-800">
                  {results.map(row => (
                    <tr key={row.month} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-bold text-blue-900 dark:text-slate-300">{row.year}</td>
                      <td className="py-3 px-4 text-sm text-blue-900/60 dark:text-slate-400">{currency.symbol}{row.interest.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-orange-600 dark:text-orange-500 font-black">{currency.symbol}{row.accruedInterest.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm font-black text-emerald-600 dark:text-emerald-500">{currency.symbol}{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <SummaryItem label={t.compoundedRate} value={`${compoundedRate.toFixed(2)}%`} sub={`${rate}% -> ${compoundedRate.toFixed(2)}%`} />
              <SummaryItem label={t.ror} value={`${ror.toFixed(2)}%`} icon={<TrendingUp className="text-emerald-500" size={20} />} />
              <SummaryItem label={t.timeToDouble} value={`${Math.ceil(72 / compoundedRate)} ${t.years}`} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ResultCard({ title, value, color, symbol = '$' }: any) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform duration-300 border-blue-100">
      <p className="text-xs font-black text-blue-900/40 dark:text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <p className={cn("text-3xl font-black tracking-tight", color)}>
        {symbol}{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </Card>
  );
}

function SummaryItem({ label, value, sub, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-blue-100 dark:border-slate-700">
        {icon || <Info size={20} className="text-blue-600" />}
      </div>
      <div>
        <p className="text-xs font-black text-blue-900/40 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-blue-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-blue-600/60 dark:text-slate-500 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// --- Engineering Calculator ---
function EngineeringCalculator() {
  const { t, theme } = useContext(AppContext);
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);

  const handleAction = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === 'DEL') setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
    else if (val === '=') {
      try {
        const result = math.evaluate(display.replace(/×/g, '*').replace(/÷/g, '/'));
        const formatted = math.format(result, { precision: 10 });
        setHistory(h => [display + ' = ' + formatted, ...h].slice(0, 10));
        setDisplay(formatted);
      } catch (e) {
        setDisplay(t.error);
        setTimeout(() => setDisplay('0'), 1000);
      }
    } else {
      setDisplay(d => d === '0' ? val : d + val);
    }
  };

  const buttons = [
    ['sin(', 'cos(', 'tan(', 'log(', 'ln('],
    ['asin(', 'acos(', 'atan(', 'sqrt(', '^'],
    ['abs(', 'exp(', 'mod', '(', ')'],
    ['7', '8', '9', 'DEL', 'C'],
    ['4', '5', '6', '×', '÷'],
    ['1', '2', '3', '+', '-'],
    ['0', '.', 'π', 'e', '=']
  ];

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <Card className={cn(
          "p-6 transition-all duration-500",
          theme === 'dark' ? "bg-slate-900/80 border-slate-800" : "bg-white border-blue-100 shadow-xl shadow-blue-900/5"
        )}>
          <div className={cn(
            "h-44 flex flex-col justify-end items-end p-8 mb-6 rounded-3xl overflow-hidden border transition-all duration-500",
            theme === 'dark' 
              ? "bg-slate-950/50 border-slate-800/50 shadow-inner" 
              : "bg-blue-50/50 border-blue-100 shadow-inner"
          )}>
            <p className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-2">{t.expression}</p>
            <div className="text-4xl font-black dark:text-white text-blue-900 tracking-tighter truncate w-full text-right" dir="ltr">
              {display}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {buttons.flat().map(btn => (
              <button 
                key={btn} 
                onClick={() => handleAction(btn)} 
                className={cn(
                  "h-16 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm", 
                  ['0','1','2','3','4','5','6','7','8','9','.'].includes(btn) 
                    ? (theme === 'dark' ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-white text-blue-900 border border-blue-100 hover:bg-blue-50") :
                  ['+','-','*','/','×','÷','='].includes(btn) 
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-200/50 dark:shadow-none" :
                  ['C','DEL'].includes(btn) 
                    ? "bg-rose-500 text-white hover:bg-rose-400 shadow-rose-200/50 dark:shadow-none" : 
                    (theme === 'dark' ? "bg-slate-700 text-blue-300 hover:bg-slate-600" : "bg-blue-50/50 text-blue-900/60 hover:bg-blue-100/50")
                )} 
                dir="ltr"
              >
                {btn === '*' ? '×' : btn === '/' ? '÷' : btn}
              </button>
            ))}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-4">
        <Card className="p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 text-blue-900"><History size={20} className="text-blue-500" /> {t.history}</h2>
            <button onClick={() => setHistory([])} className="p-2 text-blue-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-blue-300 italic text-sm">
                {t.noHistory}
              </div>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-3 bg-blue-50/50 dark:bg-slate-800/50 rounded-xl border border-blue-100 dark:border-slate-800 group relative">
                  <p className="text-[10px] text-blue-400 font-mono" dir="ltr">{h.split('=')[0]}</p>
                  <p className="text-sm font-bold dark:text-slate-200 text-blue-900 font-mono" dir="ltr">{h.split('=')[1]}</p>
                  <button onClick={() => setDisplay(h.split('=')[1].trim())} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-700 shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={12} className="text-blue-500" /></button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Currency Converter ---
const EXCHANGE_RATES: any = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.3,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.91,
  CNY: 7.23,
  HKD: 7.83,
  NZD: 1.67,
  SEK: 10.85,
  KRW: 1350,
  SGD: 1.35,
  NOK: 10.9,
  MXN: 16.5,
  INR: 83.3,
  RUB: 92.5,
  ZAR: 18.7,
  TRY: 32.2,
  BRL: 5.05,
  TWD: 32.1,
  DKK: 6.85,
  PLN: 3.95,
  THB: 36.5,
  IDR: 15900,
  HUF: 365,
  CZK: 23.5,
  ILS: 3.7,
  CLP: 940,
  PHP: 56.5,
  AED: 3.67,
  COP: 3850,
  SAR: 3.75,
  MYR: 4.75,
  RON: 4.6,
  VND: 24800,
  EGP: 47.3,
  DZD: 134.5,
  MAD: 10.1,
  TND: 3.1,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  QAR: 3.64,
  BTC: 0.000015,
  ETH: 0.00028,
  SOL: 0.0055,
  BNB: 0.0017,
  XRP: 1.65,
  ADA: 1.7,
  DOGE: 5.2,
  DOT: 0.11,
  TRX: 8.3,
  LTC: 0.01,
  LINK: 0.05,
  MATIC: 1.1,
  SHIB: 35000,
  DAI: 1,
  USDT: 1,
  USDC: 1,
  AVAX: 0.02,
  UNI: 0.08,
  ATOM: 0.09,
  PKR: 278,
  BDT: 110,
  LKR: 300,
  KES: 130,
  NGN: 1400,
  GHS: 13.5,
  UGX: 3800,
  TZS: 2500,
  ETB: 57,
  XOF: 600,
  XAF: 600,
  ARS: 860,
  PEN: 3.7,
  UYU: 38,
  PYG: 7300,
  BOB: 6.9,
  IQD: 1310,
  LYD: 4.8,
  LBP: 89500,
  SYP: 13000,
  YER: 250,
  MRU: 40,
};

function CurrencyConverter() {
  const { t, theme } = useContext(AppContext);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [val, setVal] = useState('1');

  const result = useMemo(() => {
    const amount = Number(val);
    if (isNaN(amount)) return 0;
    const inUsd = amount / EXCHANGE_RATES[from];
    return inUsd * EXCHANGE_RATES[to];
  }, [from, to, val]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="p-8">
        <h2 className="text-2xl font-black dark:text-white mb-10 text-center tracking-tight">{t.currency}</h2>
        <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-center">
          <div className="md:col-span-5 space-y-6">
            <SearchableSelect 
              label={t.from}
              value={from}
              onChange={setFrom}
              options={CURRENCIES}
            />
            <Input label={t.amount} value={val} onChange={setVal} />
          </div>
          
          <div className="md:col-span-1 flex justify-center">
            <button 
              onClick={() => {setFrom(to); setTo(from);}} 
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all rotate-90 md:rotate-0 shadow-lg active:scale-90",
                theme === 'dark' ? "bg-slate-800 text-blue-400 hover:bg-slate-700" : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 shadow-blue-900/5"
              )}
            >
              <ArrowLeftRight size={24} />
            </button>
          </div>

          <div className="md:col-span-5 space-y-6">
            <SearchableSelect 
              label={t.to}
              value={to}
              onChange={setTo}
              options={CURRENCIES}
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{t.result}</label>
              <div className="w-full px-6 py-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl text-emerald-700 dark:text-emerald-400 font-black text-3xl text-right truncate shadow-inner group-hover:scale-[1.02] transition-transform duration-300" dir="ltr">
                {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-center text-blue-400 italic font-medium">
          * {t.exchangeRateNote || 'Exchange rates are approximate and for demonstration purposes.'}
        </p>
      </Card>
    </div>
  );
}

// --- Unit Converter ---
const UNIT_DATA: any = {
  length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
  weight: ['kilogram', 'gram', 'milligram', 'metric_ton', 'pound', 'ounce'],
  area: ['square_meter', 'square_kilometer', 'hectare', 'acre', 'square_foot'],
  volume: ['liter', 'milliliter', 'cubic_meter', 'gallon', 'cup']
};

function UnitConverter() {
  const { t, theme } = useContext(AppContext);
  const [cat, setCat] = useState('length');
  const [from, setFrom] = useState('meter');
  const [to, setTo] = useState('kilometer');
  const [val, setVal] = useState('1');

  useEffect(() => {
    setFrom(UNIT_DATA[cat][0]);
    setTo(UNIT_DATA[cat][1] || UNIT_DATA[cat][0]);
  }, [cat]);

  const result = useMemo(() => {
    try {
      return math.unit(Number(val), from).to(to).toNumber();
    } catch { return 0; }
  }, [from, to, val]);

  const unitOptions = useMemo(() => {
    return UNIT_DATA[cat].map((u: string) => ({
      code: u,
      name: t[u] || u
    }));
  }, [cat, t]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.keys(UNIT_DATA).map(k => (
          <button 
            key={k} 
            onClick={() => setCat(k)} 
            className={cn(
              "px-8 py-4 rounded-3xl text-sm font-black transition-all duration-500 uppercase tracking-[0.15em] shadow-sm active:scale-95 group relative overflow-hidden", 
              cat === k 
                ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/40 -translate-y-1" 
                : "bg-white dark:bg-slate-900 text-blue-900/60 dark:text-slate-400 border border-blue-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-900 dark:hover:text-slate-200"
            )}
          >
            <span className="relative z-10">{t[k]}</span>
            {cat === k && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-100 transition-opacity" />
            )}
          </button>
        ))}
      </div>
      <Card className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-10 items-center">
          <div className="md:col-span-5 space-y-8">
            <SearchableSelect 
              label={t.from}
              value={from}
              onChange={setFrom}
              options={unitOptions}
              placeholder={t.selectUnit || "Select unit"}
            />
            <Input label={t.amount} value={val} onChange={setVal} />
          </div>

          <div className="md:col-span-1 flex justify-center">
            <button 
              onClick={() => {setFrom(to); setTo(from);}} 
              className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center transition-all rotate-90 md:rotate-0 shadow-2xl active:scale-90 group",
                theme === 'dark' ? "bg-slate-800 text-blue-400 hover:bg-slate-700" : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 shadow-blue-900/5"
              )}
            >
              <ArrowLeftRight size={28} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <div className="md:col-span-5 space-y-8">
            <SearchableSelect 
              label={t.to}
              value={to}
              onChange={setTo}
              options={unitOptions}
              placeholder={t.selectUnit || "Select unit"}
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-900/60 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{t.result}</label>
              <div className="w-full px-8 py-5 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/10 rounded-3xl text-blue-800 dark:text-blue-400 font-black text-3xl text-right truncate shadow-inner" dir="ltr">
                {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
