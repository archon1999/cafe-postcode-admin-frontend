import { RouterPathHelper } from 'app/routes';
import { DetailPageLink } from 'shared/ui/DetailPageLink/DetailPageLink';

type RestaurantDetailLinkCellProps = {
  id: string;
  name: string;
};

export function RestaurantDetailLinkCell({ id, name }: RestaurantDetailLinkCellProps) {
  return <DetailPageLink href={RouterPathHelper.organizationRestaurantDetail(id)}>{name}</DetailPageLink>;
}
