import {
  useActivateRestaurantMutation,
  useGetRestaurantActivationOptionsQuery,
} from 'modules/product-owner/business-partners/application';
import { RestaurantActivationDialog } from 'modules/product-owner/business-partners/ui/components/RestaurantActivationDialog.tsx';
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
  const activationOptionsQuery = useGetRestaurantActivationOptionsQuery({ enabled: Boolean(open) });

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
      tariffs={activationOptionsQuery.data?.tariffs ?? []}
      roles={activationOptionsQuery.data?.roles ?? []}
      permissions={activationOptionsQuery.data?.permissions ?? []}
      customTariffAllowed={Boolean(activationOptionsQuery.data?.customTariffAllowed)}
      isSubmitting={activateMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
