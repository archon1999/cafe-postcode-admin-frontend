import { useActivateRestaurantMutation } from 'modules/product-owner/business-partners/application';
import { RestaurantActivationDialog } from 'modules/product-owner/business-partners/ui/components/RestaurantActivationDialog.tsx';
import { useGetTariffsListQuery } from 'modules/product-owner/tariffs/application';
import type {
  AdminGeneratedCredentials,
  AdminRestaurant,
  AdminRestaurantActivationPayload,
} from 'shared/api/admin-types.ts';

type RestaurantActivateDialogProps = {
  restaurant: AdminRestaurant | null;
  onClose: () => void;
  onSuccess: (credentials: AdminGeneratedCredentials) => void;
};

export function RestaurantActivateDialog({ restaurant, onClose, onSuccess }: RestaurantActivateDialogProps) {
  const activateMutation = useActivateRestaurantMutation();
  const tariffsQuery = useGetTariffsListQuery({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const handleSubmit = async (payload: AdminRestaurantActivationPayload) => {
    if (!restaurant) {
      return;
    }

    const result = await activateMutation.mutateAsync({ id: restaurant.id, payload });
    onClose();
    onSuccess({
      username: result.username,
      password: result.password,
    });
  };

  return (
    <RestaurantActivationDialog
      open={Boolean(restaurant)}
      tariffs={tariffsQuery.data?.data ?? []}
      isSubmitting={activateMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
