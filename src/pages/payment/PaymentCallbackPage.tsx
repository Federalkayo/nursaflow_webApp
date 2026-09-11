import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { paystackService } from '../../services/paystack/paystackService';
import { dbService } from '../../services/supabase/dbService';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { student } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setStatus('failed');
      setErrorMessage('No payment reference found in URL.');
      return;
    }

    const verify = async () => {
      try {
        const response = await paystackService.verifyTransaction(reference);

        if (response.status && response.data?.status === 'success') {
          // Calculate 30 days subscription period end
          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          if (student?.id) {
            await dbService.upsertSubscription(
              student.id,
              'NursaFlow Pro',
              'active',
              reference,
              periodEnd
            );
          }

          setStatus('success');

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard', { state: { message: '🎉 Welcome to NursaFlow Pro! Your subscription is now active.' } });
          }, 2500);
        } else {
          setStatus('failed');
          setErrorMessage(response.message || `Payment status: ${response.data?.status || 'unsuccessful'}`);
        }
      } catch (err: unknown) {
        console.error('[Payment Callback Verification Error]:', err);
        setStatus('failed');
        const msg = err instanceof Error ? err.message : 'Unable to verify payment with server.';
        setErrorMessage(msg);
      }
    };

    verify();
  }, [searchParams, student?.id, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 space-y-6 animate-in fade-in duration-300">
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verifying Your Payment...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please wait while we confirm your Paystack transaction status with our servers.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Payment Successful!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your NursaFlow Pro subscription is now active. You will be redirected to your dashboard in a moment...
            </p>
            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard Now
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Payment Not Completed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {errorMessage || 'The payment transaction could not be verified or was cancelled.'}
            </p>
            <div className="pt-4 space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/settings')}
                icon={ArrowLeft}
              >
                Try Again / Back to Settings
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
