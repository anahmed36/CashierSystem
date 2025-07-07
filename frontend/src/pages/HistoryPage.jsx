import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSalesHistory } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react'; // Using both for RTL

const HistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getSalesHistory();
        setSales(data);
      } catch (err) {
        setError('Failed to fetch sales history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(i18n.language);
  };
  
  const handleViewDetails = (saleId) => {
      navigate(`/receipt/${saleId}`);
  };

  const ArrowIcon = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('salesHistory')}</CardTitle>
        <CardDescription>{t('salesHistoryDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('saleId')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('cashier')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('totalAmount')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.sale_id}>
                    <TableCell><Badge variant="secondary">#{sale.sale_id}</Badge></TableCell>
                    <TableCell>{formatDate(sale.sale_date)}</TableCell>
                    <TableCell>{sale.username}</TableCell>
                    <TableCell>
                        <Badge variant={sale.status === 'REFUNDED' ? 'destructive' : 'default'}>
                            {t(sale.status.toLowerCase()) || sale.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">${sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleViewDetails(sale.sale_id)}>
                         {t('viewReceipt')} <ArrowIcon className="ms-2 h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" className="h-24 text-center">
                    {t('noSalesData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryPage;