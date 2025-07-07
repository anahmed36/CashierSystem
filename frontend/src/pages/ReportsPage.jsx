import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSalesReport } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { DollarSign, Hash, BarChart2, Package } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const getMonthDateRange = () => { const today = new Date(); const firstDay = new Date(today.getFullYear(), today.getMonth(), 1); const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); return { start: firstDay.toISOString().split('T')[0], end: lastDay.toISOString().split('T')[0], }; };

const ReportsPage = () => {
    const { t } = useTranslation();
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const defaultDates = getMonthDateRange();
    const [startDate, setStartDate] = useState(defaultDates.start);
    const [endDate, setEndDate] = useState(defaultDates.end);

    const fetchReport = async () => { setIsLoading(true); setError(''); try { const data = await getSalesReport(startDate, endDate); setReportData(data); } catch (err) { setError(err.data?.message || 'Failed to fetch report.'); setReportData(null); } finally { setIsLoading(false); } };
    useEffect(() => { fetchReport(); }, []);

    return (
        <div className="space-y-6">
            <Card><CardHeader><CardTitle>{t('reportsTitle')}</CardTitle><CardDescription>{t('reportsDesc')}</CardDescription></CardHeader><CardContent className="flex items-end gap-4">
                <div className="grid gap-2"><label htmlFor="start-date" className="text-sm font-medium">{t('startDate')}</label><Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="grid gap-2"><label htmlFor="end-date" className="text-sm font-medium">{t('endDate')}</label><Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                <Button onClick={fetchReport} disabled={isLoading}>{isLoading ? t('loading') : t('generateReport')}</Button>
            </CardContent></Card>

            {error && <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-md">{error}</div>}
            {reportData && !isLoading && (<div className="grid gap-6 lg:grid-cols-5"><div className="lg:col-span-3 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(reportData.kpis.total_revenue)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('totalSales')}</CardTitle><Hash className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{reportData.kpis.total_sales}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{t('avgSaleValue')}</CardTitle><BarChart2 className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(reportData.kpis.avg_sale_value)}</div></CardContent></Card>
                </div><Card><CardHeader><CardTitle>{t('dailyBreakdown')}</CardTitle></CardHeader><CardContent><div className="border rounded-lg max-h-96 overflow-y-auto"><Table>
                    <TableHeader><TableRow><TableHead>{t('date')}</TableHead><TableHead>{t('totalSales')}</TableHead><TableHead className="text-right">{t('totalRevenue')}</TableHead></TableRow></TableHeader>
                    <TableBody>{reportData.daily_data.length > 0 ? reportData.daily_data.map(day => (<TableRow key={day.date}><TableCell className="font-medium">{day.date}</TableCell><TableCell>{day.daily_sales_count}</TableCell><TableCell className="text-right">{formatCurrency(day.daily_revenue)}</TableCell></TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="h-24 text-center">{t('noSalesData')}</TableCell></TableRow>}</TableBody></Table></div ></CardContent></Card>
            </div><div className="lg:col-span-2"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Package size={20}/> {t('topSellingProducts')}</CardTitle><CardDescription>{t('topSellingProductsDesc')}</CardDescription></CardHeader><CardContent>
                <div className="border rounded-lg max-h-[30rem] overflow-y-auto"><Table><TableHeader><TableRow><TableHead>{t('productNameLabel')}</TableHead><TableHead className="text-right">{t('quantitySold')}</TableHead></TableRow></TableHeader>
                <TableBody>{reportData.top_products.length > 0 ? reportData.top_products.map((prod, index) => (<TableRow key={index}><TableCell className="font-medium">{prod.product_name}</TableCell><TableCell className="text-right font-bold">{prod.total_quantity_sold}</TableCell></TableRow>
                )) : <TableRow><TableCell colSpan={2} className="h-24 text-center">{t('noProductsSold')}</TableCell></TableRow>}</TableBody></Table></div>
            </CardContent></Card></div></div>)}
        </div>
    );
};
export default ReportsPage;