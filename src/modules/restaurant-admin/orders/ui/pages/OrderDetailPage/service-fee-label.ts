import type { AdminServiceFeeComponent } from 'shared/api/admin-types';

export function formatServiceFeeRateLabel(component: AdminServiceFeeComponent, hourlyLabel = 'Soatlik') {
  if (component.mode === 'hourly') return hourlyLabel;
  return `${Number(component.percent ?? 0)}%`;
}
