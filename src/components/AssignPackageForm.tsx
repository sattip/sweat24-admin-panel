import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { usersApi } from '@/services/apiService';
import { packagesApi } from '@/services/api';

type AssignPackageFormProps = {
  userId: string;
  onAssigned?: () => void;
};

export function AssignPackageForm({ userId, onAssigned }: AssignPackageFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoadingPackages(true);
        const response = await packagesApi.getAll();
        const list = (response as any)?.data || response || [];
        const normalized = Array.isArray(list) ? list : [];
        const activeOnly = normalized.filter((p: any) => (p?.status ?? 'active') === 'active');
        setAvailablePackages(activeOnly);
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.message || 'Αποτυχία φόρτωσης πακέτων';
        toast({ title: 'Σφάλμα', description: msg, variant: 'destructive' });
      } finally {
        setLoadingPackages(false);
      }
    };
    loadPackages();
  }, [toast]);

  const handleAssign = async () => {
    if (!selectedPackageId) {
      toast({ title: 'Επιλογή πακέτου', description: 'Παρακαλώ επιλέξτε πακέτο.', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      await usersApi.assignPackage(userId, { package_id: selectedPackageId });
      toast({ title: 'Επιτυχία', description: 'Το πακέτο ανατέθηκε στον πελάτη.' });
      onAssigned?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Αποτυχία ανάθεσης πακέτου';
      toast({ title: 'Σφάλμα', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Επιλέξτε πακέτο</Label>
        <Select onValueChange={setSelectedPackageId} value={selectedPackageId} disabled={loadingPackages}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingPackages ? 'Φόρτωση...' : 'Επιλέξτε πακέτο'} />
          </SelectTrigger>
          <SelectContent>
            {availablePackages.map((pkg: any) => {
              const id = pkg.id?.toString?.() ?? pkg.id;
              return (
                <SelectItem key={id} value={id}>
                  {pkg.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={handleAssign} disabled={submitting || !selectedPackageId}>
          {submitting ? 'Ανάθεση...' : 'Ανάθεση'}
        </Button>
      </div>
    </div>
  );
}

export default AssignPackageForm;


