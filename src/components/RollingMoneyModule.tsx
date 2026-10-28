import React, { useState, useMemo } from 'react';
import { ExpenseTransaction, calculateRollingMoney, USD_TO_XAF_RATE } from '../utils/commandLogic';
import { DollarSign, Receipt, Plus, CheckCircle, Clock, PieChart, FileText, Edit2, Trash2, Check, X, ArrowDownRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { getDeviceLocalDateTime } from '../utils/localDateTime';

interface RollingMoneyModuleProps {
  transactions: ExpenseTransaction[];
  allocatedUSD: number;
  onAddTransaction: (newTx: ExpenseTransaction) => void;
  onUpdateTransaction?: (updatedTx: ExpenseTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onApproveTransaction: (id: string) => void;
  onUpdateAllocatedUSD?: (newTotal: number) => void;
  activeRole: string;
  canEdit?: boolean;
  isCommander?: boolean;
  isAuthorizedEditor?: boolean;
}

export const RollingMoneyModule: React.FC<RollingMoneyModuleProps> = ({
  transactions,
  allocatedUSD,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onApproveTransaction,
  onUpdateAllocatedUSD,
  activeRole,
  canEdit = true,
  isCommander = true,
  isAuthorizedEditor = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExpenseTransaction | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ExpenseTransaction | null>(null);

  // Add Money form state
  const [addMoneyAmount, setAddMoneyAmount] = useState<number>(1000);
  const [addMoneyNote, setAddMoneyNote] = useState<string>('UN Contingency Imprest Tranche / Sector West Allocation');

  // New expense form
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseTransaction['category']>('Camp Fortification');
  const [newAmountUSD, setNewAmountUSD] = useState<number>(150);
  const [newStatus, setNewStatus] = useState<ExpenseTransaction['status']>('Approved');

  // Edit expense form state
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseTransaction['category']>('Camp Fortification');
  const [editAmountUSD, setEditAmountUSD] = useState<number>(0);
  const [editCurrency, setEditCurrency] = useState<'USD' | 'XAF'>('USD');
  const [editStatus, setEditStatus] = useState<ExpenseTransaction['status']>('Approved');
  const [editApprovedBy, setEditApprovedBy] = useState('');

  // Categories list including 'Any Other'
  const categoriesList: ExpenseTransaction['category'][] = [
    'Camp Fortification',
    'Vehicle Spares',
    'Emergency Medical',
    'CIMIC / Goodwill',
    'Water / Generator Fuel',
    'Stationery / Admin',
    'Any Other',
  ];

  // Dynamic financial calculation: Automatically deducts cumulative expenditure from total allocated fund
  const fin = useMemo(() => {
    let totalSpentUSD = 0;
    let pendingApprovalUSD = 0;
    const categoryTotals: Record<string, number> = {
      'Camp Fortification': 0,
      'Vehicle Spares': 0,
      'Emergency Medical': 0,
      'CIMIC / Goodwill': 0,
      'Water / Generator Fuel': 0,
      'Stationery / Admin': 0,
      'Any Other': 0,
    };

    for (const tx of transactions) {
      if (tx.status === 'Approved') {
        totalSpentUSD += tx.amountUSD;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amountUSD;
      } else {
        pendingApprovalUSD += tx.amountUSD;
      }
    }

    // Available amount automatically deducted from total allocated amount
    const balanceUSD = allocatedUSD - totalSpentUSD;
    const balanceXAF = balanceUSD * USD_TO_XAF_RATE;
    const totalSpentXAF = totalSpentUSD * USD_TO_XAF_RATE;

    return {
      allocatedUSD,
      totalSpentUSD,
      totalSpentXAF,
      balanceUSD,
      balanceXAF,
      pendingApprovalUSD,
      categoryTotals,
    };
  }, [allocatedUSD, transactions]);

  // Handle Add Newly Allocated Money
  const handleAddMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountToAdd = Number(addMoneyAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    const newTotal = allocatedUSD + amountToAdd;
    if (onUpdateAllocatedUSD) {
      onUpdateAllocatedUSD(newTotal);
    }
    setShowAddMoneyModal(false);
    setAddMoneyAmount(1000);
  };

  // Handle Create Expense Voucher
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmountUSD) return;

    const newTx: ExpenseTransaction = {
      id: `tx-${Date.now()}`,
      date: getDeviceLocalDateTime().date,
      description: newDesc.trim(),
      category: newCategory,
      amountUSD: Number(newAmountUSD),
      approvedBy: newStatus === 'Approved' ? 'Maj Fakrul Islam' : 'Pending Commander Sign-off',
      currency: 'USD',
      status: newStatus,
    };

    onAddTransaction(newTx);
    setShowAddModal(false);
    setNewDesc('');
    setNewAmountUSD(150);
  };

  // Start editing a transaction
  const handleStartEdit = (tx: ExpenseTransaction) => {
    setEditingTransaction(tx);
    setEditDate(tx.date);
    setEditDesc(tx.description);
    setEditCategory(tx.category);
    setEditAmountUSD(tx.amountUSD);
    setEditCurrency(tx.currency);
    setEditStatus(tx.status);
    setEditApprovedBy(tx.approvedBy);
  };

  // Save edited transaction
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !editDesc.trim() || editAmountUSD <= 0) return;

    const updated: ExpenseTransaction = {
      ...editingTransaction,
      date: editDate.trim() || editingTransaction.date,
      description: editDesc.trim(),
      category: editCategory,
      amountUSD: Number(editAmountUSD),
      currency: editCurrency,
      status: editStatus,
      approvedBy: editStatus === 'Approved' ? (editApprovedBy.includes('Pending') ? 'Maj Fakrul Islam' : editApprovedBy) : 'Pending Commander Sign-off',
    };

    if (onUpdateTransaction) {
      onUpdateTransaction(updated);
    }
    setEditingTransaction(null);
  };

  // Delete transaction
  const handleDeleteTx = (id: string) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Financial Health Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                COMPANY ROLLING MONEY &amp; CONTINGENCY IMPREST
              </h2>
              <p className="text-xs text-slate-400">
                Authorized UN Field Operations Fund • Central African Republic Deployment (USD &amp; XAF Francs)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Add Money Button */}
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition active:scale-95"
              title="Add newly allocated money in the total fund"
            >
              <Plus className="w-4 h-4" />
              <span>Add Money</span>
            </button>

            {/* Create Expense Voucher Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Create Expense Voucher</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          {/* Card 1: TOTAL ALLOCATED (IMPREST) */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center relative group">
            <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">
              TOTAL ALLOCATED (IMPREST)
            </span>
            <span className="text-xl font-black text-white block my-0.5">
              ${fin.allocatedUSD.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {(fin.allocatedUSD * USD_TO_XAF_RATE).toLocaleString()} XAF
            </span>
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              title="Add newly allocated money"
            >
              <Plus className="w-3 h-3" />
              <span>Add Money</span>
            </button>
          </div>

          {/* Card 2: CUMULATIVE EXPENDITURE */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">
              CUMULATIVE EXPENDITURE
            </span>
            <span className="text-xl font-black text-amber-400 block my-0.5">
              ${fin.totalSpentUSD.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {fin.totalSpentXAF.toLocaleString()} XAF
            </span>
            <span className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {transactions.filter((t) => t.status === 'Approved').length} Approved Vouchers
            </span>
          </div>

          {/* Card 3: AVAILABLE CASH BALANCE (Automatically deducts expenditure from total allocated amount) */}
          <div className={`p-3 rounded-lg border text-center transition ${
            fin.balanceUSD < 500
              ? 'bg-rose-950/40 border-rose-500/60 shadow-lg'
              : 'bg-emerald-950/30 border-emerald-500/60'
          }`}>
            <span className="text-slate-300 text-[10px] block font-bold uppercase tracking-wider">
              AVAILABLE CASH BALANCE
            </span>
            <span className={`text-xl font-black block my-0.5 ${
              fin.balanceUSD < 500 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              ${fin.balanceUSD.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-300/80 block">
              {fin.balanceXAF.toLocaleString()} XAF
            </span>
            {/* Automatic deduction formula breakdown */}
            <div className="mt-1 text-[9px] text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
              ${fin.allocatedUSD.toLocaleString()} Allocated - ${fin.totalSpentUSD.toLocaleString()} Spent
            </div>
          </div>

          {/* Card 4: PENDING COMMANDER SIGN-OFF */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-center">
            <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">
              PENDING COMMANDER SIGN-OFF
            </span>
            <span className="text-xl font-black text-sky-400 block my-0.5">
              ${fin.pendingApprovalUSD.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {(fin.pendingApprovalUSD * USD_TO_XAF_RATE).toLocaleString()} XAF
            </span>
            <span className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              {transactions.filter((t) => t.status !== 'Approved').length} Pending Vouchers
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Badges (Includes 'Any Other') */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 text-[11px] px-1 font-bold">SPEND BY CATEGORY:</span>
        {categoriesList.map((cat) => {
          const amt = fin.categoryTotals[cat] || 0;
          return (
            <span
              key={cat}
              className={`px-2.5 py-1 rounded-lg border transition ${
                amt > 0
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              {cat}: <strong className={amt > 0 ? 'text-emerald-400' : 'text-slate-400'}>${amt}</strong>
            </span>
          );
        })}
      </div>

      {/* Transactions Table with Edit Button for Commander & Authorized Account */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-xs font-mono tracking-wider uppercase">
              EXPENDITURE VOUCHERS LISTING ({transactions.length} RECORDS)
            </h3>
          </div>
          {canEdit && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Commander / Authorized Account: Edit &amp; Delete Enabled
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3">Voucher Date</th>
                <th className="px-3 py-3">Particulars &amp; Purpose</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Amount (USD / CFA)</th>
                <th className="px-3 py-3">Approving Officer</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {transactions.map((tx) => {
                const isApproved = tx.status === 'Approved';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-3 py-3 font-mono text-slate-400 whitespace-nowrap">{tx.date}</td>

                    <td className="px-3 py-3">
                      <div className="font-bold text-white">{tx.description}</div>
                    </td>

                    <td className="px-3 py-3 font-mono text-sky-400 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {tx.category}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <div className="font-bold text-emerald-400">${tx.amountUSD} USD</div>
                      <div className="text-[10px] text-slate-400">
                        {(tx.amountUSD * USD_TO_XAF_RATE).toLocaleString()} XAF
                      </div>
                    </td>

                    <td className="px-3 py-3 text-slate-300 text-[11px]">
                      {tx.approvedBy}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    {/* Actions column: Edit button for Commander and Authorized Account */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isApproved && (
                          <button
                            onClick={() => onApproveTransaction(tx.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow"
                            title="Sign-Off as Commander"
                          >
                            Sign-Off
                          </button>
                        )}

                        {/* Edit Button: Visible for Commander and Authorized Account */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(tx)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-semibold transition"
                            title="Edit this expenditure voucher (Commander & Authorized Co-Editor)"
                          >
                            <Edit2 className="w-3 h-3 text-sky-400" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* Delete Button for Commander / Authorized Account */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTx(tx.id)}
                            className="p-1 rounded bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                            title="Delete this expenditure voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Money to Total Fund Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  ADD NEWLY ALLOCATED MONEY TO TOTAL FUND
                </h3>
              </div>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMoneySubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700/60 font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>CURRENT TOTAL ALLOCATED:</span>
                  <span className="font-bold text-white">${allocatedUSD.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CUMULATIVE EXPENDITURE:</span>
                  <span className="font-bold text-amber-400">${fin.totalSpentUSD.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-emerald-400 pt-1 border-t border-slate-700/60 font-bold">
                  <span>NEW TOTAL FUND AFTER ADDING:</span>
                  <span>${(allocatedUSD + (Number(addMoneyAmount) || 0)).toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-emerald-300 text-[11px]">
                  <span>NEW AVAILABLE CASH BALANCE:</span>
                  <span>${((allocatedUSD + (Number(addMoneyAmount) || 0)) - fin.totalSpentUSD).toLocaleString()} USD</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Amount to Add in Total Fund (USD) *
                </label>
                <input
                  type="number"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(Number(e.target.value))}
                  min={1}
                  step={50}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-base font-bold focus:border-emerald-500 outline-none"
                  required
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  ≈ {((Number(addMoneyAmount) || 0) * USD_TO_XAF_RATE).toLocaleString()} XAF
                </span>
              </div>

              {/* Quick Add Preset Buttons */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5 font-mono">QUICK PRESETS:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddMoneyAmount(preset)}
                      className={`px-2.5 py-1.5 rounded-lg border font-mono font-bold transition text-xs ${
                        addMoneyAmount === preset
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      +${preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Allocation Authority / Reference Note
                </label>
                <input
                  type="text"
                  value={addMoneyNote}
                  onChange={(e) => setAddMoneyNote(e.target.value)}
                  placeholder="e.g. UNHQ Imprest Tranche / Force Commander Discretionary Fund"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  Add Money to Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal for Commander and Authorized Account */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  EDIT EXPENDITURE VOUCHER
                </h3>
              </div>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Voucher Date *</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expense Particulars / Purpose *</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Amount (USD) *</label>
                  <input
                    type="number"
                    value={editAmountUSD}
                    onChange={(e) => setEditAmountUSD(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-sky-500 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    ≈ {(Number(editAmountUSD || 0) * USD_TO_XAF_RATE).toLocaleString()} XAF
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Voucher Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Approved">Approved (Deduct from fund)</option>
                    <option value="Pending Commander Sign-off">Pending Commander Sign-off</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Approving Authority</label>
                <input
                  type="text"
                  value={editApprovedBy}
                  onChange={(e) => setEditApprovedBy(e.target.value)}
                  placeholder="e.g. Maj Fakrul Islam"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteTx(editingTransaction.id)}
                  className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 font-semibold transition"
                >
                  Delete Voucher
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/40 bg-slate-900 p-5 shadow-2xl text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                RECORD FIELD EXPENSE VOUCHER
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Expense Particulars / Item Description *</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="e.g. 200 sandbags from Bambari river supplier for bunker revetment"
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Expenditure Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Amount (USD) *</label>
                  <input
                    type="number"
                    value={newAmountUSD}
                    onChange={(e) => setNewAmountUSD(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    ≈ {(newAmountUSD * USD_TO_XAF_RATE).toLocaleString()} XAF
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Approval Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Approved">Approved (Automatically deducts from Available Cash Balance)</option>
                  <option value="Pending Commander Sign-off">Pending Commander Sign-off</option>
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] font-mono text-slate-300">
                <span className="text-slate-400 block text-[10px]">CURRENT AVAILABLE CASH BALANCE:</span>
                <div className="flex justify-between items-center mt-0.5">
                  <span>Before Voucher: <strong className="text-white">${fin.balanceUSD.toLocaleString()}</strong></span>
                  <span className="text-emerald-400">
                    After Voucher: <strong>${Math.max(0, fin.balanceUSD - (newStatus === 'Approved' ? newAmountUSD : 0)).toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Submit &amp; Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
