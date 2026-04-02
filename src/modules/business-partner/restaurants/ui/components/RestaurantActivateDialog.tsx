import { useActivateRestaurantMutation } from 'modules/product-owner/business-partners/application';
import { RestaurantActivationDialog } from 'modules/product-owner/business-partners/ui/components/RestaurantActivationDialog.tsx';
import { useGetTariffsListQuery } from 'modules/product-owner/tariffs/application';
import type {
  AdminGeneratedCredentials,
  AdminRestaurant,
  AdminRestaurantActivationPayload,
} from 'shared/api/admin-types.ts';

type RestaurantActivateDialogProps = {
  open: AdminRestaurant | null;
  onClose: () => void;
  onSuccess: (credentials: AdminGeneratedCredentials) => void;
};

export function RestaurantActivateDialog({ open, onClose, onSuccess }: RestaurantActivateDialogProps) {
  const activateMutation = useActivateRestaurantMutation();
  const tariffsQuery = useGetTariffsListQuery({
    page: 1,
    pageSize: 100,
    isActive: true,
  }, { enabled: Boolean(open) });

  const handleSubmit = async (payload: AdminRestaurantActivationPayload) => {
    if (!open) {
      return;
    }

    const result = await activateMutation.mutateAsync({ id: open.id, payload });
    onSuccess({
      username: result.username,
      password: result.password,
    });
  };

  return (
    <RestaurantActivationDialog
      open={Boolean(open)}
      tariffs={tariffsQuery.data?.data ?? []}
      isSubmitting={activateMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
