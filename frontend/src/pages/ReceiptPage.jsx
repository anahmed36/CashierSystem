import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSaleDetails, processRefund } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ReceiptPage = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefunding, setIsRefunding] = useState(false);
    const [error, setError] = useState('');
    const { saleId } = useParams();
    const { t, i18n } = useTranslation();

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try { const data = await getSaleDetails(saleId); setDetails(data); } catch (err) { setError('Failed to load sale details.'); } finally { setLoading(false); }
    }, [saleId]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    const handlePrint = () => window.print();
    const handleRefund = async () => {
        if (!window.confirm('Are you sure?')) return;
        setIsRefunding(true);
        try { await processRefund(saleId); await fetchDetails(); } catch(err) { alert(err.data?.message || 'Failed to process refund.'); } finally { setIsRefunding(false); }
    }

    const BackArrowIcon = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

    if (loading) return <div>Loading receipt...</div>;
    if (error) return <div className="text-destructive flex items-center gap-2"><AlertCircle/>{error}</div>;
    if (!details || !details.sale) return <div>Receipt not found.</div>;

    const { sale, items, payment } = details;
    const isRefunded = sale.status === 'REFUNDED';

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 shadow-lg">
             <div className="flex justify-between items-center mb-6 no-print">
                <Button asChild variant="outline"><Link to="/history"><BackArrowIcon className="me-2 h-4 w-4"/> {t('backToHistory')}</Link></Button>
                <div className="text-center"><h1 className="text-2xl font-bold">{t('saleReceipt')}</h1>{isRefunded && <Badge variant="destructive" className="mt-1">REFUNDED</Badge>}</div>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline"><Printer className="me-2 h-4 w-4"/> {t('print')}</Button>
                    {!isRefunded && (<Button variant="destructive" onClick={handleRefund} disabled={isRefunding}>
                        <RotateCw className={`me-2 h-4 w-4 ${isRefunding ? 'animate-spin' : ''}`} />
                        {isRefunding ? t('refunding') : t('refundSale')}
                    </Button>)}
                </div>
             </div>
             
             <div id="receipt-print-area" className="font-mono text-sm text-black">
                <div className="text-center mb-6"><h2 className="text-lg font-bold">CashierPro Inc.</h2><p>123 Commerce St, Business City, 12345</p></div>
                <div className="border-t border-b border-dashed border-black py-2 mb-4">
                    <div className="flex justify-between"><span>{t('saleId')}:</span> <span>#{sale.sale_id}</span></div>
                    <div className="flex justify-between"><span>{t('status')}:</span> <span>{sale.status}</span></div>
                    <div className="flex justify-between"><span>{t('date')}:</span> <span>{new Date(sale.sale_date).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>{t('cashier')}:</span> <span>{sale.username}</span></div>
                </div>
                <Table><TableHeader><TableRow><TableHead className="text-left">{t('item')}</TableHead><TableHead className="text-center">{t('qty')}</TableHead><TableHead className="text-right">{t('price')}</TableHead><TableHead className="text-right">{t('total')}</TableHead></TableRow></TableHeader><TableBody>
                        {items.map(item => (<TableRow key={item.sale_item_id}><TableCell className="text-left">{item.name}</TableCell><TableCell className="text-center">{item.quantity}</TableCell><TableCell className="text-right">${item.price.toFixed(2)}</TableCell><TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell></TableRow>))}
                </TableBody></Table>
                <div className="border-t-2 border-dashed border-black mt-4 pt-2">
                     <div className="flex justify-between font-bold text-base"><span>TOTAL</span><span>${sale.total_amount.toFixed(2)}</span></div>
                     <div className="flex justify-between"><span>{t('card')}</span><span>{payment?.payment_type}</span></div>
                </div><div className="text-center mt-8"><p>{t('thankYou')}</p></div>
            </div>
        </div>
    );
};