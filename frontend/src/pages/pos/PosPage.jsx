import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  Utensils,
  ShoppingBag,
  User,
  Phone,
  RotateCcw,
  AlertTriangle,
  FileText,
  Info,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Edit3,
  ArrowRight,
  ShieldAlert,
  Wifi,
  WifiOff,
  HardDrive,
  Lock,
  Database,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import * as posApi from '../../services/posApi';
import PosReceiptPreviewModal from '../../components/pos/PosReceiptPreviewModal';
import PosShortcutsModal from '../../components/pos/PosShortcutsModal';
import PosCheckoutModal from '../../components/pos/PosCheckoutModal';
import PosBillSuccessModal from '../../components/pos/PosBillSuccessModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import PosSyncCenterModal from '../../components/pos/PosSyncCenterModal';
import PosBackupRestoreModal from '../../components/pos/PosBackupRestoreModal';
import PosIdleLockModal from '../../components/pos/PosIdleLockModal';
import { getAmbiguousMarker } from '../../utils/submissionLifecycle';
import {
  posDb,
  cacheCatalog,
  getCachedCatalog,
  getRegisteredDevice,
  saveDeviceRegistration,
  saveOfflineLease,
} from '../../db/posDatabase';
import syncEngine from '../../services/syncEngine';

/**
 * POS Foundation & Desktop Counter Billing Interface (Phase 5.1 & Phase 5.2)
 *
 * Implements:
 * - Live catalog loading from authoritative endpoints (without fake mock data)
 * - Rapid search (/ shortcut) & category filtering
 * - Strict 86/out-of-stock dish prevention
 * - Cart management with selected-item keyboard quantity adjustments (+ / -)
 * - Integer paise financial arithmetic (zero floating-point math errors)
 * - DINE_IN vs TAKEAWAY toggle & cabin/table reference
 * - Customer phone lookup & loyalty integration
 * - Functional Checkout Modal with CASH, UPI, CARD confirmations (Phase 5.2)
 * - Authoritative POST /api/v1/pos/bills sequence bill creation (Phase 5.2)
 * - Finalized Bill Success Modal with deliberate "Start New Order" action (Phase 5.2)
 * - Authoritative ESC/POS thermal receipt integration (Phase 5.2)
 * - Ivory + Royal Plum + Champagne Gold design system
 */
export default function PosPage() {
  const { user } = useAuth();

  // Catalog State
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'

  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedCartItemId, setSelectedCartItemId] = useState(null);
  const [editingNotesItemId, setEditingNotesItemId] = useState(null);

  // Order Details State
  const [orderType, setOrderType] = useState('DINE_IN'); // 'DINE_IN' | 'TAKEAWAY'
  const [cabinTableRef, setCabinTableRef] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);

  // Modals & Finalized Bill State
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBillSuccessModalOpen, setIsBillSuccessModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Phase 5.4 Offline PWA Modals & State
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isIdleLocked, setIsIdleLocked] = useState(false);
  const [isUsingCachedCatalog, setIsUsingCachedCatalog] = useState(false);

  // Authoritative Completed Bill Details
  const [finalizedBill, setFinalizedBill] = useState(null);
  const [previewedTotalAtCheckout, setPreviewedTotalAtCheckout] = useState(0);
  const [receiptBillId, setReceiptBillId] = useState(null); // Non-null = authoritative; null = draft preview

  // Ambiguous Submission Lockout State
  const [ambiguousMarker, setAmbiguousMarker] = useState(() => getAmbiguousMarker());

  // Check ambiguous marker on mount
  useEffect(() => {
    const marker = getAmbiguousMarker();
    setAmbiguousMarker(marker);
    if (marker) {
      setIsCheckoutModalOpen(true);
    }
  }, []);

  // Update ambiguous marker when checkout modal state toggles
  useEffect(() => {
    setAmbiguousMarker(getAmbiguousMarker());
  }, [isCheckoutModalOpen]);

  // Sync Engine Background Lifecycle
  useEffect(() => {
    syncEngine.start();
    const unsubscribe = syncEngine.subscribe((status) => {
      setIsOnline(status.isOnline);
      setPendingSyncCount(status.totalUnsynced);
    });
    return () => {
      unsubscribe();
      syncEngine.stop();
    };
  }, []);

  // 5-minute Inactivity Auto-Lock
  useEffect(() => {
    let idleTimer;
    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdleLocked(true);
      }, 5 * 60 * 1000); // 5 minutes inactivity
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  // Device Enrollment & Asymmetric Offline Lease Initialization
  useEffect(() => {
    async function initDeviceAndLease() {
      try {
        let device = await getRegisteredDevice();
        if (!device && syncEngine.isOnline) {
          const deviceId = `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const regRes = await posApi.registerPosDevice({
            deviceId,
            deviceName: 'Station Stories Counter POS',
            browserInfo: navigator.userAgent ? navigator.userAgent.slice(0, 100) : 'Browser',
            osInfo: navigator.platform || 'macOS',
          });
          await saveDeviceRegistration(regRes);
          device = regRes;
        }

        if (syncEngine.isOnline && user?.id) {
          // Fetch and store backend RSA-2048 public key
          let spkiKey = null;
          try {
            const pubKeyRes = await posApi.getPosPublicKey();
            spkiKey = pubKeyRes?.publicKey || pubKeyRes?.spkiBase64 || pubKeyRes?.publicKeySpkiBase64;
            if (spkiKey) {
              await posDb.appSettings.put({
                key: 'pos_rsa_public_key',
                value: spkiKey,
                updatedAt: new Date().toISOString(),
              });
            }
          } catch (e) {
            console.warn('Failed to fetch POS public key:', e);
          }

          // Request / Refresh 24-hour asymmetric offline lease
          if (device?.deviceId) {
            try {
              const leaseRes = await posApi.requestOfflineLease({
                deviceId: device.deviceId,
                cashierId: user.id,
                cashierUsername: user.username,
              });
              if (leaseRes?.leaseToken) {
                await saveOfflineLease({
                  cashierId: user.id,
                  deviceId: device.deviceId,
                  cashierUsername: user.username,
                  cashierFullName: user.fullName || user.username,
                  leaseToken: leaseRes.leaseToken,
                  publicKeySpkiBase64: leaseRes.publicKeySpkiBase64 || spkiKey,
                  issuedAt: leaseRes.issuedAt,
                  expiresAt: leaseRes.expiresAt,
                });
              }
            } catch (leaseErr) {
              console.warn('Failed to renew offline lease:', leaseErr);
            }
          }
        }
      } catch (err) {
        console.error('Error during POS device/lease initialization:', err);
      }
    }

    initDeviceAndLease();
  }, [user]);

  // Refs
  const searchInputRef = useRef(null);

  // 1. Fetch live categories and menu items with IndexedDB offline caching
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsUsingCachedCatalog(false);
    try {
      const [catsData, itemsData] = await Promise.all([
        posApi.getPosCategories(),
        posApi.getPosMenuItems({ availableOnly: false }),
      ]);
      const validCats = Array.isArray(catsData) ? catsData : [];
      const validItems = Array.isArray(itemsData) ? itemsData : [];
      setCategories(validCats);
      setMenuItems(validItems);
      // Cache in IndexedDB for offline counter operations
      await cacheCatalog(validCats, validItems);
    } catch (err) {
      console.warn('Network catalog fetch failed, loading IndexedDB offline cache:', err);
      try {
        const cached = await getCachedCatalog();
        if (cached.isCached) {
          setCategories(cached.categories);
          setMenuItems(cached.menuItems);
          setIsUsingCachedCatalog(true);
        } else {
          setError(err.message || 'Failed to connect to billing server and no offline cache available.');
        }
      } catch (cacheErr) {
        setError(err.message || 'Failed to connect to billing server.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // 2. Filtered items computed via memoization
  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    // Category filter
    if (selectedCategory !== 'ALL') {
      items = items.filter((item) => Number(item.categoryId) === Number(selectedCategory));
    }

    // Diet filter (Veg / Non-veg)
    if (dietFilter === 'VEG') {
      items = items.filter((item) => {
        const isVeg = item.veg ?? item.isVeg ?? true;
        return isVeg === true;
      });
    } else if (dietFilter === 'NON_VEG') {
      items = items.filter((item) => {
        const isVeg = item.veg ?? item.isVeg ?? true;
        return isVeg === false;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(q);
        const hindiMatch = item.hindiName?.includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        return nameMatch || hindiMatch || descMatch;
      });
    }

    return items;
  }, [menuItems, selectedCategory, dietFilter, searchQuery]);

  // 3. Integer Paise Arithmetic for Financial Integrity
  const financialTotals = useMemo(() => {
    const subtotalPaise = cart.reduce((sum, item) => {
      const itemPricePaise = Math.round(Number(item.price || 0) * 100);
      return sum + itemPricePaise * item.quantity;
    }, 0);

    const subtotal = subtotalPaise / 100;
    const discountPaise = 0; // Phase 5.2 discount feature (NONE)
    const discount = discountPaise / 100;
    const taxPaise = 0; // GST disabled
    const tax = taxPaise / 100;
    const payablePaise = subtotalPaise - discountPaise + taxPaise;
    const payableTotal = payablePaise / 100;
    const totalItemUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotalPaise,
      subtotal,
      discountPaise,
      discount,
      taxPaise,
      tax,
      payablePaise,
      payableTotal,
      totalItemUnits,
    };
  }, [cart]);

  // Check if any items in cart are currently marked unavailable (86)
  const unavailableCartItems = useMemo(() => {
    return cart.filter((cartItem) => {
      const catalogItem = menuItems.find((m) => m.id === cartItem.id);
      if (!catalogItem) return false;
      const isAvailable = catalogItem.available ?? catalogItem.isAvailable ?? true;
      return !isAvailable;
    });
  }, [cart, menuItems]);

  // Currency Formatter
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // 4. Cart Operations
  const handleAddToCart = (item) => {
    const isAvailable = item.available ?? item.isAvailable ?? true;
    if (!isAvailable) return; // 86 switch protection

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: item.id,
            name: item.name,
            hindiName: item.hindiName,
            price: Number(item.price),
            veg: item.veg ?? item.isVeg ?? true,
            quantity: 1,
            notes: '',
          },
        ];
      }
    });

    setSelectedCartItemId(item.id);
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    if (selectedCartItemId === itemId) {
      setSelectedCartItemId(null);
    }
  };

  const handleUpdateNotes = (itemId, notes) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setSelectedCartItemId(null);
    setIsClearModalOpen(false);
  };

  // 5. Customer Phone Lookup
  const handlePhoneChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(val);

    if (val.length === 10) {
      setCustomerLookupLoading(true);
      try {
        const found = await posApi.lookupCustomer(val);
        if (found) {
          setCustomerFound(found);
          if (found.name && !customerName) {
            setCustomerName(found.name);
          }
        } else {
          setCustomerFound(null);
        }
      } catch {
        setCustomerFound(null);
      } finally {
        setCustomerLookupLoading(false);
      }
    } else {
      setCustomerFound(null);
    }
  };

  // 6. Checkout & Settlement Flow (Phase 5.2 & Phase 5.3)
  const handleOpenCheckout = () => {
    if (getAmbiguousMarker()) {
      setIsCheckoutModalOpen(true);
      return;
    }
    if (cart.length === 0) return;
    if (unavailableCartItems.length > 0) return;
    setIsCheckoutModalOpen(true);
  };

  // Callback when authoritative bill creation succeeds
  const handleBillSuccess = (createdBill) => {
    setFinalizedBill(createdBill);
    setPreviewedTotalAtCheckout(financialTotals.payableTotal);
    setIsCheckoutModalOpen(false);
    setIsBillSuccessModalOpen(true);
    // Note: Do NOT clear cart yet! Cart is cleared only on deliberate "Start New Order" action.
  };

  // Start new order (deliberate user action)
  const handleStartNewOrder = () => {
    setIsBillSuccessModalOpen(false);
    setFinalizedBill(null);
    setReceiptBillId(null);
    setCart([]);
    setSelectedCartItemId(null);
    setCabinTableRef('');
    setCustomerPhone('');
    setCustomerName('');
    setCustomerFound(null);
  };

  // View Authoritative Finalized Thermal Receipt (server or local bill)
  const handleViewAuthoritativeReceipt = (billId, billObj = null) => {
    setReceiptBillId(billId);
    if (billObj) {
      setFinalizedBill(billObj);
    }
    setIsReceiptModalOpen(true);
  };

  // View Draft Order Preview Receipt
  const handleViewDraftReceipt = () => {
    setReceiptBillId(null);
    setIsReceiptModalOpen(true);
  };

  // 7. Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      // 1. "/" focuses search bar
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // 2. "Escape" key handling (modal hierarchy)
      if (e.key === 'Escape') {
        if (isReceiptModalOpen) {
          setIsReceiptModalOpen(false);
          return;
        }
        if (isCheckoutModalOpen) {
          if (getAmbiguousMarker()) {
            return; // STRICT LOCKOUT: Counter is locked pending manager reconciliation
          }
          setIsCheckoutModalOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isClearModalOpen) {
          setIsClearModalOpen(false);
          return;
        }
        if (isInputFocused) {
          activeEl.blur();
          return;
        }
        if (selectedCartItemId) {
          setSelectedCartItemId(null);
          return;
        }
      }

      // 3. Shortcuts requiring Alt key
      if (e.altKey) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          if (cart.length > 0) setIsClearModalOpen(true);
          return;
        }
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setOrderType('DINE_IN');
          return;
        }
        if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          setOrderType('TAKEAWAY');
          return;
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleViewDraftReceipt();
          return;
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          if (cart.length > 0 && unavailableCartItems.length === 0) {
            handleOpenCheckout();
          }
          return;
        }
      }

      // 4. F4 key triggers checkout directly
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && unavailableCartItems.length === 0) {
          handleOpenCheckout();
        }
        return;
      }

      // 5. "?" toggles shortcuts modal
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 6. Quantity shortcuts (+ / - / Del) for selected cart item
      if (!isInputFocused && selectedCartItemId) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleUpdateQuantity(selectedCartItemId, 1);
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          handleUpdateQuantity(selectedCartItemId, -1);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleRemoveFromCart(selectedCartItemId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isClearModalOpen,
    isCheckoutModalOpen,
    isReceiptModalOpen,
    isShortcutsModalOpen,
    selectedCartItemId,
    cart.length,
    unavailableCartItems.length,
  ]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans">
      {/* Offline / Online Top Bar Controls */}
      <div className="mb-2 px-3.5 py-1.5 rounded-2xl bg-white border border-lavender-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-[11px] shadow-2xs hover:bg-emerald-100 transition-colors"
              title="Online - Connected to billing server. Click to open Sync Center."
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online</span>
              {pendingSyncCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
                  {pendingSyncCount} unsynced
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] shadow-2xs hover:bg-amber-200 transition-colors"
              title="Offline Mode Active - Cash billing only. Click to open Sync Center."
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              <span>Offline Mode (Cash Only)</span>
              {pendingSyncCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold">
                  {pendingSyncCount} queued
                </span>
              )}
            </button>
          )}

          {isUsingCachedCatalog && (
            <span className="text-[11px] text-body-muted italic hidden sm:inline">
              (Loaded from offline cache)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Center Trigger */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-body-muted hover:text-plum-royal hover:bg-lavender-50 transition-colors text-[11px] font-medium border border-lavender-200"
            title="Open Offline Sync Center"
          >
            <Database className="w-3.5 h-3.5 text-gold" />
            <span>Sync Center</span>
          </button>

          {/* USB Backup / Restore Trigger */}
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-body-muted hover:text-plum-royal hover:bg-lavender-50 transition-colors text-[11px] font-medium border border-lavender-200"
            title="USB Backup & Restore"
          >
            <HardDrive className="w-3.5 h-3.5 text-gold" />
            <span>USB Backup</span>
          </button>

          {/* Manual Screen Lock Trigger */}
          <button
            type="button"
            onClick={() => setIsIdleLocked(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-body-muted hover:text-plum-royal hover:bg-lavender-50 transition-colors text-[11px] font-medium border border-lavender-200"
            title="Lock Counter (Requires PIN)"
          >
            <Lock className="w-3.5 h-3.5 text-plum-royal" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Ambiguous Submission Warning & Counter Lockout Banner */}
      {ambiguousMarker && (
        <div className="mb-2.5 p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="font-bold text-xs text-amber-950">
                Counter Lockout: Ambiguous Submission Pending Resolution
              </div>
              <div className="text-[11px] text-amber-800">
                A bill submission on this counter encountered a network timeout or interruption. New orders cannot be placed until resolved.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 shadow-xs transition-colors"
          >
            Reconcile Submission
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-3.5 min-h-0 overflow-hidden">
      {/* ==================================================================== */}
      {/* LEFT COLUMN: Product Catalog, Search, Categories, Grid */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col bg-white border border-lavender-200 rounded-2xl shadow-soft overflow-hidden min-w-0">
        {/* Top Control Bar: Search & Diet Toggles */}
        <div className="p-3 sm:p-3.5 border-b border-lavender-200 bg-lavender-50/50 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
          {/* Product Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-body-muted absolute left-3 top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name / हिंदी (Press / to search)..."
              className="w-full bg-white border border-lavender-200 focus:border-plum-royal focus:ring-1 focus:ring-plum-royal rounded-xl pl-9 pr-9 py-2 text-xs text-body placeholder-body-muted/70 transition-all shadow-xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-body-muted hover:text-plum-royal"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-2 text-[10px] bg-lavender-100 text-body-muted px-1.5 py-0.5 rounded font-mono border border-lavender-200">
                /
              </kbd>
            )}
          </div>

          {/* Diet Filter Switcher (All / Veg / Non-Veg) */}
          <div className="flex items-center gap-1 bg-lavender-100 p-1 rounded-xl border border-lavender-200 shrink-0 self-start sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDietFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dietFilter === 'ALL'
                  ? 'bg-plum-royal text-ivory shadow-xs'
                  : 'text-body-muted hover:text-plum-royal'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            <button
              type="button"
              onClick={() => setDietFilter('VEG')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                dietFilter === 'VEG'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-body-muted hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Veg</span>
            </button>
            <button
              type="button"
              onClick={() => setDietFilter('NON_VEG')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                dietFilter === 'NON_VEG'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-body-muted hover:text-rose-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Pill Selector */}
        <div className="px-3.5 py-2 border-b border-lavender-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'ALL'
                ? 'bg-plum-royal text-ivory border-plum-royal shadow-xs'
                : 'bg-lavender-50 hover:bg-lavender-100 text-body border-lavender-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-plum-royal text-ivory border-plum-royal shadow-xs'
                    : 'bg-lavender-50 hover:bg-lavender-100 text-body border-lavender-200'
                }`}
              >
                <span>{cat.name}</span>
                {cat.hindiName && (
                  <span className={`text-[10px] font-hindi opacity-80 ${isSelected ? 'text-gold-light' : 'text-body-muted'}`}>
                    ({cat.hindiName})
                  </span>
                )}
                {cat.itemCount !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-gold/30 text-white' : 'bg-lavender-200 text-body-muted'
                    }`}
                  >
                    {cat.itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Catalog Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 bg-ivory-50/40">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gold animate-spin mb-3" />
              <div className="font-serif font-bold text-base text-plum-royal">
                Loading Counter Catalog...
              </div>
              <p className="text-xs text-body-muted mt-1">
                Connecting to live server endpoints
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-plum-royal">
                Unable to Load Menu Items
              </h3>
              <p className="text-xs text-body-muted mt-1 mb-4 leading-relaxed">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchCatalog}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-body-muted">
              <Utensils className="w-10 h-10 text-gold/60 mb-2" />
              <div className="font-serif font-bold text-base text-plum-royal">
                No matching dishes found
              </div>
              <p className="text-xs mt-1 text-body-muted max-w-xs">
                No menu items match your search "{searchQuery}" or active category filters.
              </p>
              {(searchQuery || selectedCategory !== 'ALL' || dietFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setDietFilter('ALL');
                  }}
                  className="mt-3 text-xs text-plum-royal font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
              {filteredItems.map((item) => {
                const isAvailable = item.available ?? item.isAvailable ?? true;
                const isVeg = item.veg ?? item.isVeg ?? true;
                const cartEntry = cart.find((c) => c.id === item.id);
                const quantityInCart = cartEntry ? cartEntry.quantity : 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleAddToCart(item)}
                    className={`relative text-left p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between group select-none ${
                      !isAvailable
                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                        : quantityInCart > 0
                        ? 'bg-plum-50/50 border-plum-royal/40 shadow-soft hover:border-plum-royal hover:shadow-md'
                        : 'bg-white border-lavender-200 hover:border-gold/60 hover:shadow-soft active:scale-[0.98]'
                    }`}
                  >
                    {/* Top Row: Veg/Non-Veg Icon & Category/86 Tag */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      {/* FSSAI Veg / Non-Veg Indicator */}
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isVeg
                            ? 'border-emerald-600 bg-white'
                            : 'border-red-600 bg-white'
                        }`}
                        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                      </span>

                      {/* 86 / Out of Stock Badge */}
                      {!isAvailable ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                          86 / Out of Stock
                        </span>
                      ) : quantityInCart > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-plum-royal text-ivory font-mono shadow-xs">
                          {quantityInCart} in cart
                        </span>
                      ) : (
                        <span className="text-[10px] text-body-muted/70 truncate max-w-[80px]">
                          {item.categoryName}
                        </span>
                      )}
                    </div>

                    {/* Dish Title & Hindi Subtitle */}
                    <div className="flex-1 mb-2">
                      <div className="font-serif font-bold text-sm text-plum-royal group-hover:text-plum-dark leading-tight line-clamp-2">
                        {item.name}
                      </div>
                      {item.hindiName && (
                        <div className="text-[11px] font-hindi text-body-muted mt-0.5 line-clamp-1">
                          {item.hindiName}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Price & Add Feedback */}
                    <div className="pt-2 border-t border-lavender-100 flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-plum-royal">
                        {formatINR(item.price)}
                      </span>
                      {isAvailable && (
                        <span className="w-6 h-6 rounded-lg bg-lavender-100 group-hover:bg-plum-royal group-hover:text-ivory text-plum-royal flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* RIGHT COLUMN: Active Cart, Order Type, Financials, Settle Action */}
      {/* ==================================================================== */}
      <div className="w-full lg:w-[390px] xl:w-[420px] bg-white border border-lavender-200 rounded-2xl shadow-soft flex flex-col justify-between shrink-0 overflow-hidden">
        {/* Cart Top Section: Order Header & Controls */}
        <div className="p-3.5 border-b border-lavender-200 bg-lavender-50/50 space-y-3 shrink-0">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-plum-royal text-gold flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-base text-plum-royal">
                Active Order
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-lavender-200 text-plum-royal">
                {financialTotals.totalItemUnits} {financialTotals.totalItemUnits === 1 ? 'item' : 'items'}
              </span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(true)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                  title="Clear Cart (Alt + C)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Order Type Toggle: DINE_IN vs TAKEAWAY */}
          <div className="grid grid-cols-2 gap-1.5 bg-lavender-100 p-1 rounded-xl border border-lavender-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                orderType === 'DINE_IN'
                  ? 'bg-plum-royal text-ivory shadow-xs'
                  : 'text-body-muted hover:text-plum-royal'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-gold" />
              <span>Dine-In</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                orderType === 'TAKEAWAY'
                  ? 'bg-plum-royal text-ivory shadow-xs'
                  : 'text-body-muted hover:text-plum-royal'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-gold" />
              <span>Takeaway (Parcel)</span>
            </button>
          </div>

          {/* Cabin / Table Input (Shown when DINE_IN) */}
          {orderType === 'DINE_IN' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-body-muted whitespace-nowrap">
                Table / Cabin: <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={cabinTableRef}
                onChange={(e) => setCabinTableRef(e.target.value)}
                placeholder="e.g. Table 4 / Cabin B"
                className={`flex-1 bg-white border rounded-lg px-2.5 py-1 text-xs text-body placeholder-body-muted/60 transition-colors ${
                  !cabinTableRef.trim() && cart.length > 0
                    ? 'border-amber-400 focus:border-plum-royal'
                    : 'border-lavender-200 focus:border-plum-royal'
                }`}
              />
            </div>
          )}

          {/* Customer Details Row (Optional) */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-lavender-200/60">
            <div className="relative">
              <Phone className="w-3 h-3 text-body-muted absolute left-2 top-2" />
              <input
                type="tel"
                value={customerPhone}
                onChange={handlePhoneChange}
                maxLength={10}
                placeholder="Customer Phone"
                className="w-full bg-white border border-lavender-200 focus:border-plum-royal rounded-lg pl-7 pr-2 py-1 text-xs text-body placeholder-body-muted/60 font-mono"
              />
            </div>
            <div className="relative">
              <User className="w-3 h-3 text-body-muted absolute left-2 top-2" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full bg-white border border-lavender-200 focus:border-plum-royal rounded-lg pl-7 pr-2 py-1 text-xs text-body placeholder-body-muted/60"
              />
            </div>
          </div>
          {customerFound && (
            <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center justify-between">
              <span>Loyal Customer: <strong>{customerFound.name}</strong></span>
              {(customerFound.visitCount || customerFound.totalVisits) ? (
                <span>{customerFound.visitCount || customerFound.totalVisits} visits • Spent {formatINR(customerFound.totalSpent || 0)}</span>
              ) : null}
            </div>
          )}
        </div>

        {/* Cart Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-ivory-50/20">
          {/* Out of Stock Warning Banner in Cart */}
          {unavailableCartItems.length > 0 && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>{unavailableCartItems.length} item(s)</strong> in your cart are currently out of stock. Remove them before checkout.
              </span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-body-muted">
              <div className="w-12 h-12 rounded-2xl bg-lavender-100 flex items-center justify-center text-plum-royal mb-2">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="font-serif font-bold text-sm text-plum-royal">
                Cart is Empty
              </div>
              <p className="text-[11px] text-body-muted mt-1 max-w-[200px]">
                Click dishes from catalog or press <kbd className="bg-lavender-200 px-1 py-0.5 rounded font-mono text-[10px]">/</kbd> to search.
              </p>
              <div className="mt-4 p-2.5 rounded-xl bg-lavender-50 border border-lavender-200 text-[10px] text-left space-y-1 w-full max-w-[240px]">
                <div className="font-semibold text-plum-royal">Quick Keys:</div>
                <div className="flex justify-between"><span>Focus Search:</span> <kbd className="font-mono font-bold">/</kbd></div>
                <div className="flex justify-between"><span>Qty Up / Down:</span> <kbd className="font-mono font-bold">+ / -</kbd></div>
                <div className="flex justify-between"><span>Proceed to Checkout:</span> <kbd className="font-mono font-bold">F4 / Alt+S</kbd></div>
                <div className="flex justify-between"><span>Clear Cart:</span> <kbd className="font-mono font-bold">Alt + C</kbd></div>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const isSelected = selectedCartItemId === item.id;
              const itemTotal = (Math.round(item.price * 100) * item.quantity) / 100;
              const isEditingNotes = editingNotesItemId === item.id;
              const isItemUnavailable = unavailableCartItems.some((u) => u.id === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCartItemId(item.id)}
                  className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                    isItemUnavailable
                      ? 'bg-red-50/60 border-red-300'
                      : isSelected
                      ? 'bg-plum-50/70 border-plum-royal ring-1 ring-plum-royal shadow-xs'
                      : 'bg-white border-lavender-200 hover:border-gold/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                            item.veg ? 'border-emerald-600 bg-white' : 'border-red-600 bg-white'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.veg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                        <span className="font-bold text-plum-royal truncate">
                          {item.name}
                        </span>
                        {isItemUnavailable && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold uppercase">
                            Out of stock
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-body-muted pl-4">
                        {formatINR(item.price)} each
                      </div>
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center gap-1 shrink-0 bg-lavender-100 rounded-lg p-0.5 border border-lavender-200" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-plum-royal hover:bg-white transition-colors"
                        title="Decrease (-)"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-plum-royal">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-plum-royal hover:bg-white transition-colors"
                        title="Increase (+)"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Item Total */}
                    <div className="text-right font-mono font-bold text-plum-royal shrink-0 w-16">
                      {formatINR(itemTotal)}
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromCart(item.id);
                      }}
                      className="text-body-muted hover:text-red-600 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Kitchen Notes Toggle / Input */}
                  <div className="mt-1.5 pl-4 pt-1 border-t border-lavender-100/60" onClick={(e) => e.stopPropagation()}>
                    {isEditingNotes ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                          placeholder="Kitchen note (e.g. less spicy)..."
                          className="flex-1 bg-white border border-lavender-200 rounded px-2 py-0.5 text-[11px] text-body"
                          autoFocus
                          onBlur={() => setEditingNotesItemId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingNotesItemId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditingNotesItemId(null)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingNotesItemId(item.id)}
                        className="text-[10px] text-body-muted hover:text-plum-royal flex items-center gap-1"
                      >
                        <Edit3 className="w-2.5 h-2.5 text-gold" />
                        <span>{item.notes ? `Note: ${item.notes}` : '+ Add note'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Financial Summary & Bottom Settlement Action */}
        <div className="p-3.5 border-t border-lavender-200 bg-lavender-50/60 space-y-2.5 shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-body-muted">
              <span>Subtotal ({financialTotals.totalItemUnits} items)</span>
              <span className="font-mono font-semibold text-body">
                {formatINR(financialTotals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-body-muted">
              <span className="flex items-center gap-1">
                <span>Tax</span>
                <span className="text-[10px] px-1 rounded bg-lavender-200 text-plum-royal font-medium">
                  GST Disabled
                </span>
              </span>
              <span className="font-mono text-emerald-600 font-semibold">₹0.00</span>
            </div>
            <div className="flex justify-between text-body-muted">
              <span>Discount</span>
              <span className="font-mono text-body">₹0.00</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-lavender-200 text-plum-royal">
              <span className="font-serif font-bold text-base">Payable Total</span>
              <span className="font-mono font-bold text-xl text-plum-royal">
                {formatINR(financialTotals.payableTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Preview Draft Receipt & Shortcuts */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleViewDraftReceipt}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-lavender-100 hover:bg-lavender-200 text-plum-royal font-semibold border border-lavender-200 transition-colors shadow-xs"
                title="Preview ESC/POS Draft Receipt (Alt + P)"
              >
                <Printer className="w-3.5 h-3.5 text-gold" />
                <span>Draft Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShortcutsModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-lavender-100 hover:bg-lavender-200 text-plum-royal font-semibold border border-lavender-200 transition-colors shadow-xs"
                title="View Hotkeys (?)"
              >
                <Info className="w-3.5 h-3.5 text-gold" />
                <span>Shortcuts (?)</span>
              </button>
            </div>

            {/* Settle & Finalize Bill Button (Phase 5.2 & 5.3) */}
            <button
              type="button"
              disabled={Boolean(ambiguousMarker) ? false : (cart.length === 0 || unavailableCartItems.length > 0)}
              onClick={handleOpenCheckout}
              className={`w-full py-2.5 px-4 rounded-xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-soft transition-all ${
                ambiguousMarker
                  ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-md'
                  : cart.length > 0 && unavailableCartItems.length === 0
                  ? 'bg-plum-royal hover:bg-plum-dark text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-plum-royal/40 text-ivory/60 cursor-not-allowed shadow-none border border-plum-900/10'
              }`}
              title={ambiguousMarker ? "Counter Locked - Resolve Ambiguous Submission" : "Proceed to Payment & Bill Generation (F4 / Alt + S)"}
            >
              {ambiguousMarker ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span>Resolve Ambiguous Submission</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-white" />
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-gold" />
                  <span>
                    Proceed to Checkout ({formatINR(financialTotals.payableTotal)})
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1 text-gold" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* ==================================================================== */}
      {/* MODALS */}
      {/* ==================================================================== */}

      {/* 1. Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearCart}
        title="Clear Current Order Cart?"
        message={`Are you sure you want to discard all ${financialTotals.totalItemUnits} items currently in the cart? This cannot be undone.`}
        confirmText="Clear Cart"
        cancelText="Keep Items"
        confirmVariant="danger"
      />

      {/* 2. Functional Checkout & Payment Settlement Modal (Phase 5.2 & Phase 5.4 Offline PWA) */}
      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        orderType={orderType}
        cabinTableRef={cabinTableRef}
        customerName={customerName}
        customerPhone={customerPhone}
        subtotal={financialTotals.subtotal}
        payableTotal={financialTotals.payableTotal}
        onBillSuccess={handleBillSuccess}
        isOffline={!isOnline}
      />

      {/* 3. Completed Bill / Invoice Success Modal (Phase 5.2) */}
      <PosBillSuccessModal
        isOpen={isBillSuccessModalOpen}
        bill={finalizedBill}
        previewedTotal={previewedTotalAtCheckout}
        onViewReceipt={handleViewAuthoritativeReceipt}
        onStartNewOrder={handleStartNewOrder}
      />

      {/* 4. 58mm Thermal Receipt Modal (Authoritative & Local offline modes) */}
      <PosReceiptPreviewModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptBillId(null);
        }}
        billId={receiptBillId}
        localBill={finalizedBill}
        cart={cart}
        orderType={orderType}
        tableRef={cabinTableRef}
        customerName={customerName}
        customerPhone={customerPhone}
        cashierName={user?.fullName || user?.username || 'Counter Operator'}
        subtotal={financialTotals.subtotal}
        tax={financialTotals.tax}
        discount={financialTotals.discount}
        payableTotal={financialTotals.payableTotal}
      />

      {/* 5. Keyboard Shortcuts Reference Modal */}
      <PosShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* 6. Offline Sync Center Modal (Phase 5.4) */}
      <PosSyncCenterModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* 7. USB Backup & Restore Modal (Phase 5.4) */}
      <PosBackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* 8. 5-minute Inactivity Idle Lock Modal (Phase 5.4) */}
      <PosIdleLockModal
        isLocked={isIdleLocked}
        onUnlock={() => setIsIdleLocked(false)}
        cashierName={user?.fullName || user?.username || 'Counter Cashier'}
        cashierId={user?.id}
      />
    </div>
  );
}
