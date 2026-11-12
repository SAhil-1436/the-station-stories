import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, RefreshCw, Database, Server, Cpu } from 'lucide-react';
import { getHealth } from '../../services/api';

export default function HealthStatusBanner() {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHealth();
      setHealthData(response.data);
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Could not connect to backend REST API');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isConnected = !!healthData && healthData.status === 'UP';
  const isDbConnected = healthData?.databaseStatus === 'CONNECTED';

  return (
    <div className="bg-charcoal-800/80 border border-charcoal-700 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-charcoal-700/60">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <h3 className="font-semibold text-ivory-50 text-sm tracking-wide">
            {t('devStatus.title')}
          </h3>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs bg-charcoal-700 hover:bg-charcoal-700/80 text-ivory-200 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Checking...' : 'Re-check Health'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
        {/* Backend Status */}
        <div className="flex items-start gap-3 bg-charcoal-900/60 p-3 rounded-lg border border-charcoal-700/40">
          <Server className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-gray-400">{t('devStatus.backendStatus')}</div>
            <div className="font-medium mt-0.5 flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t('devStatus.connected')} (Port 8080)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">{error || t('devStatus.disconnected')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="flex items-start gap-3 bg-charcoal-900/60 p-3 rounded-lg border border-charcoal-700/40">
          <Database className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-gray-400">{t('devStatus.database')}</div>
            <div className="font-medium mt-0.5 flex items-center gap-1.5">
              {isDbConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{healthData.databaseName} (MySQL)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">{isConnected ? 'Connecting...' : 'Unavailable'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Runtime Environment */}
        <div className="flex items-start gap-3 bg-charcoal-900/60 p-3 rounded-lg border border-charcoal-700/40">
          <Cpu className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-gray-400">{t('devStatus.phase')}</div>
            <div className="font-medium mt-0.5 text-ivory-100 truncate">
              {healthData?.phase || 'Phase 1 - Project Foundation'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-charcoal-700/30 text-[11px] text-gray-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <span>{t('devStatus.uptimeNotice')}</span>
        {healthData?.timestamp && (
          <span className="text-gray-400 font-mono">
            Verified: {new Date(healthData.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
