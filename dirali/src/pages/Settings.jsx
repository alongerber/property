import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Shield,
  AlertTriangle,
  Check,
  User,
  Home,
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/calculations';
import SliderInput from '../components/shared/SliderInput';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function Settings() {
  const netIncome = useStore((s) => s.netIncome);
  const setNetIncome = useStore((s) => s.setNetIncome);
  const isFirstProperty = useStore((s) => s.isFirstProperty);
  const setIsFirstProperty = useStore((s) => s.setIsFirstProperty);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);

  const [importConfirm, setImportConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);
  const pendingImportRef = useRef(null);

  const handleExport = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dirali-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.properties) {
          setImportError('קובץ לא תקין — חסרים נתוני נכסים');
          return;
        }
        pendingImportRef.current = data;
        setImportConfirm(true);
      } catch {
        setImportError('שגיאה בקריאת הקובץ — JSON לא תקין');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    const data = pendingImportRef.current;
    if (data) {
      const ok = importData(data);
      if (ok) {
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('ייבוא נכשל — נתונים לא תקינים');
      }
    }
    pendingImportRef.current = null;
    setImportConfirm(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0B1120' }} dir="rtl">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-5">
          <SettingsIcon size={20} style={{ color: '#8B5CF6' }} />
          <h1 className="text-lg font-bold" style={{ color: '#E2E8F0' }}>
            הגדרות
          </h1>
        </div>

        {/* Personal details */}
        <div className="space-y-4">
          <div
            className="rounded-2xl p-4 space-y-4"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <User size={16} style={{ color: '#3B82F6' }} />
              <h3 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                פרטים אישיים
              </h3>
            </div>

            <SliderInput
              label="הכנסה נטו חודשית"
              value={netIncome}
              onChange={setNetIncome}
              min={5000}
              max={50000}
              step={500}
              unit="₪"
              color="#10B981"
            />
          </div>

          {/* Property type */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Home size={16} style={{ color: '#F59E0B' }} />
              <h3 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                סוג רכישה
              </h3>
            </div>

            <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
              משפיע על חישוב מס רכישה ומגבלת LTV של בנק ישראל
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsFirstProperty(true)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  backgroundColor: isFirstProperty ? '#3B82F61A' : '#0F172A',
                  border: `1px solid ${isFirstProperty ? '#3B82F6' : '#334155'}`,
                }}
              >
                <Shield size={20} style={{ color: isFirstProperty ? '#3B82F6' : '#64748B' }} />
                <span className="text-sm font-medium" style={{ color: isFirstProperty ? '#E2E8F0' : '#94A3B8' }}>
                  דירה יחידה
                </span>
                <span className="text-xs" style={{ color: '#64748B' }}>
                  LTV עד 75%
                </span>
              </button>

              <button
                onClick={() => setIsFirstProperty(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  backgroundColor: !isFirstProperty ? '#F59E0B1A' : '#0F172A',
                  border: `1px solid ${!isFirstProperty ? '#F59E0B' : '#334155'}`,
                }}
              >
                <AlertTriangle size={20} style={{ color: !isFirstProperty ? '#F59E0B' : '#64748B' }} />
                <span className="text-sm font-medium" style={{ color: !isFirstProperty ? '#E2E8F0' : '#94A3B8' }}>
                  דירה נוספת
                </span>
                <span className="text-xs" style={{ color: '#64748B' }}>
                  מס 8% | LTV 50%
                </span>
              </button>
            </div>

            {!isFirstProperty && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 rounded-lg p-3"
                style={{ backgroundColor: '#F59E0B1A', border: '1px solid #F59E0B33' }}
              >
                <p className="text-xs" style={{ color: '#F59E0B' }}>
                  בעל דירה קיימת — מס רכישה 8% מהשקל הראשון (במקום מדרגות).
                  אם תמכור את הדירה הנוכחית תוך 24 חודשים, ייתכן שתזכה להחזר.
                </p>
              </motion.div>
            )}
          </div>

          {/* Data management */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: '#10B981' }} />
              <h3 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                ניהול נתונים
              </h3>
            </div>

            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
              כל הנתונים שמורים בדפדפן בלבד. מומלץ לגבות באופן קבוע.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                }}
              >
                <Download size={16} />
                ייצוא גיבוי (JSON)
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#E2E8F0',
                  border: '1px solid #334155',
                }}
              >
                <Upload size={16} />
                ייבוא מגיבוי
              </button>

              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {importSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 rounded-lg p-2.5"
                style={{ backgroundColor: '#10B9811A', border: '1px solid #10B98133' }}
              >
                <Check size={14} style={{ color: '#10B981' }} />
                <span className="text-xs" style={{ color: '#10B981' }}>
                  הנתונים יובאו בהצלחה
                </span>
              </motion.div>
            )}

            {importError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 rounded-lg p-2.5"
                style={{ backgroundColor: '#EF44441A', border: '1px solid #EF444433' }}
              >
                <AlertTriangle size={14} style={{ color: '#EF4444' }} />
                <span className="text-xs" style={{ color: '#EF4444' }}>
                  {importError}
                </span>
                <button
                  onClick={() => setImportError('')}
                  className="mr-auto text-xs cursor-pointer"
                  style={{ color: '#64748B' }}
                >
                  סגור
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={importConfirm}
        onClose={() => {
          setImportConfirm(false);
          pendingImportRef.current = null;
        }}
        onConfirm={confirmImport}
        title="ייבוא נתונים"
        message="פעולה זו תחליף את כל הנתונים הקיימים. האם להמשיך?"
        confirmText="ייבא"
        cancelText="ביטול"
        variant="danger"
      />
    </div>
  );
}
