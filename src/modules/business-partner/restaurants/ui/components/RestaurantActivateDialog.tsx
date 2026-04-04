import { useActivateRestaurantMutation } from 'modules/product-owner/business-partners/application';
import { RestaurantActivationDialog } from 'modules/product-owner/business-partners/ui/components/RestaurantActivationDialog.tsx';
import { useGetTariffOptionsQuery } from 'modules/product-owner/tariffs/application';
import type {
  AdminRestaurant,
  AdminRestaurantActivationPayload,
  AdminRestaurantActivationResult,
} from 'shared/api/admin-types.ts';

type RestaurantActivateDialogProps = {
  open: AdminRestaurant | null;
  onClose: () => void;
  onSuccess: (result: AdminRestaurantActivationResult) => void;
};

export function RestaurantActivateDialog({ open, onClose, onSuccess }: RestaurantActivateDialogProps) {
  const activateMutation = useActivateRestaurantMutation();
  const tariffsQuery = useGetTariffOptionsQuery({ enabled: Boolean(open) });

  const handleSubmit = async (payload: AdminRestaurantActivationPayload) => {
    if (!open) {
      return;
    }

    const result = await activateMutation.mutateAsync({ id: open.id, payload });
    onSuccess(result);
  };

  return (
    <RestaurantActivationDialog
      open={Boolean(open)}
      tariffs={tariffsQuery.data ?? []}
      isSubmitting={activateMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
