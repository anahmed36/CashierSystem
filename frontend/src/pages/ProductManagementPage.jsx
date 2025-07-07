import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';

const ProductManagementPage = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try { const data = await getAllProducts(); setProducts(data); } catch (err) { setError('Failed to fetch products.'); } finally { setIsLoading(false); }
    };
    useEffect(() => { fetchProducts(); }, []);

    const handleOpenDialog = (product = null) => { setCurrentProduct(product || { barcode: '', name: '', price: '', stock: '' }); setIsDialogOpen(true); };
    const handleSaveProduct = async (e) => { e.preventDefault();
        const { product_id, name, price, stock, barcode } = currentProduct;
        try {
            if (product_id) await updateProduct(product_id, { name, price, stock }); else await addProduct({ barcode, name, price, stock });
            setIsDialogOpen(false); fetchProducts();
        } catch (err) { alert(err.data?.message || 'Failed to save product.'); }
    };
    const handleDeleteProduct = async (productId) => { if (window.confirm('Are you sure?')) { try { await deleteProduct(productId); fetchProducts(); } catch (err) { alert(err.data?.message || 'Failed to delete product.'); }} };
    const handleInputChange = (e) => { const { name, value } = e.target; setCurrentProduct(prev => ({ ...prev, [name]: value })); }

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-destructive">{error}</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>{t('productManagement')}</CardTitle><CardDescription>{t('addProductDesc')}</CardDescription></div>
                <Button onClick={() => handleOpenDialog()}><PlusCircle className="me-2 h-4 w-4" /> {t('addProduct')}</Button>
            </CardHeader><CardContent><div className="border rounded-lg"><Table>
                <TableHeader><TableRow><TableHead>{t('barcode')}</TableHead><TableHead>{t('productNameLabel')}</TableHead><TableHead>{t('price')}</TableHead><TableHead>{t('stock')}</TableHead><TableHead className="text-right">{t('actions')}</TableHead></TableRow></TableHeader>
                <TableBody>{products.map(p => (<TableRow key={p.product_id}>
                    <TableCell className="font-mono">{p.barcode}</TableCell><TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>${parseFloat(p.price).toFixed(2)}</TableCell><TableCell>{p.stock}</TableCell>
                    <TableCell className="text-right space-x-2"><Button variant="outline" size="icon" onClick={() => handleOpenDialog(p)}><Pencil className="h-4 w-4" /></Button><Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(p.product_id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>))}
            </TableBody></Table></div></CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{currentProduct?.product_id ? t('editProduct') : t('addNewProduct')}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSaveProduct} className="grid gap-4 py-4">
                        <Input name="barcode" placeholder={t('barcode')} value={currentProduct?.barcode || ''} onChange={handleInputChange} disabled={!!currentProduct?.product_id} required/>
                        <Input name="name" placeholder={t('productName')} value={currentProduct?.name || ''} onChange={handleInputChange} required />
                        <Input name="price" type="number" step="0.01" placeholder={t('pricePlaceholder')} value={currentProduct?.price || ''} onChange={handleInputChange} required />
                        <Input name="stock" type="number" placeholder={t('stockQuantity')} value={currentProduct?.stock || ''} onChange={handleInputChange} required />
                        <DialogFooter><Button type="submit">{t('saveProduct')}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
export default ProductManagementPage;