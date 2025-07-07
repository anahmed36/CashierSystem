import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductByBarcode, createSale } from '../lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Minus, XCircle, ShoppingCart, DollarSign } from 'lucide-react';

const CashierPage = () => {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const barcodeInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => { barcodeInputRef.current?.focus(); }, []);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault(); if (!barcode.trim()) return; setError('');
    try {
      const product = await getProductByBarcode(barcode);
      setCart((prevCart) => {
        const existingItem = prevCart.find(item => item.product_id === product.product_id);
        return existingItem ? prevCart.map(item => item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item) : [...prevCart, { ...product, quantity: 1 }];
      });
      setBarcode('');
    } catch (err) { setError(err.data?.message || `Product with barcode ${barcode} not found.`); setTimeout(() => setError(''), 3000); }
  };
  const updateQuantity = (productId, delta) => setCart((prev) => prev.map(item => item.product_id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (productId) => setCart(cart.filter(item => item.product_id !== productId));
  const handleFinalizeSale = async (payment_type) => {
    if (cart.length === 0) return;
    try {
      const result = await createSale({ items: cart.map(({ product_id, quantity, price }) => ({ product_id, quantity, price })), payment_type: payment_type });
      setIsDialogOpen(false); setCart([]); navigate(`/receipt/${result.sale_id}`);
    } catch (err) { setError(err.data?.message || 'Failed to complete the sale.'); setIsDialogOpen(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3">
        <Card><CardHeader>
            <CardTitle>{t('scanProducts')}</CardTitle>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2 pt-2">
              <Input ref={barcodeInputRef} type="text" placeholder={t('barcodePlaceholder')} value={barcode} onChange={(e) => setBarcode(e.target.value)}/>
              <Button type="submit">{t('add')}</Button>
            </form>
            {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
        </CardHeader><CardContent>
            <div className="border rounded-lg max-h-[60vh] overflow-y-auto"><Table><TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow><TableHead>{t('product')}</TableHead><TableHead className="w-[150px] text-center">{t('quantity')}</TableHead><TableHead className="w-[120px] text-right">{t('subtotal')}</TableHead><TableHead className="w-12"></TableHead></TableRow>
            </TableHeader><TableBody>{cart.length > 0 ? (cart.map((item) => (<TableRow key={item.product_id}><TableCell>
                <div className="font-medium">{item.name}</div><div className="text-sm text-muted-foreground">${item.price.toFixed(2)} ea.</div>
              </TableCell><TableCell><div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, -1)}><Minus size={14}/></Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, 1)}><Plus size={14}/></Button>
              </div></TableCell><TableCell className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
              <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.product_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))) : (
                <TableRow><TableCell colSpan={4} className="h-48 text-center text-muted-foreground"><ShoppingCart className="mx-auto mb-2 h-10 w-10"/>{t('cartEmpty')}</TableCell></TableRow>
              )}</TableBody></Table></div>
        </CardContent></Card>
      </div><div className="xl:col-span-2">
        <Card className="sticky top-24"><CardHeader><CardTitle>{t('saleSummary')}</CardTitle><CardDescription>{t('saleSummaryDesc')}</CardDescription></CardHeader><CardContent className="space-y-4">
             <div className="flex justify-between items-baseline font-bold text-4xl"><span className="text-muted-foreground text-2xl">{t('total')}</span><span>${totalAmount.toFixed(2)}</span></div>
        </CardContent><CardFooter className="flex flex-col gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button className="w-full h-12 text-lg" disabled={cart.length === 0}><DollarSign className="me-2"/>{t('completeSale')}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{t('confirmPayment')}</DialogTitle><DialogDescription>{t('confirmPaymentDesc', { total: '$' + totalAmount.toFixed(2) })}</DialogDescription></DialogHeader>
                <DialogFooter className="grid grid-cols-2 gap-4"><Button onClick={() => handleFinalizeSale('Cash')} className="h-16 text-lg">{t('cash')}</Button><Button onClick={() => handleFinalizeSale('Card')} className="h-16 text-lg">{t('card')}</Button></DialogFooter>
              </DialogContent>
             </Dialog>
             <Button variant="destructive" className="w-full" onClick={() => setCart([])} disabled={cart.length === 0}><XCircle className="me-2"/>{t('cancelSale')}</Button>
        </CardFooter></Card>
      </div>
    </div>
  );
};
export default CashierPage;