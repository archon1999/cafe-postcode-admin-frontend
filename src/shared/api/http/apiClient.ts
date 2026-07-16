import { adminBusinessPartnerGateway } from './adminBusinessPartnerGateway.ts';
import { adminCashDeskGateway } from './adminCashDeskGateway.ts';
import { adminCatalogGateway } from './adminCatalogGateway.ts';
import { adminDiningTableGateway } from './adminDiningTableGateway.ts';
import { adminDistributionPointGateway } from './adminDistributionPointGateway.ts';
import { adminHallGateway } from './adminHallGateway.ts';
import { adminIdentityGateway } from './adminIdentityGateway.ts';
import { adminIntegrationGateway } from './adminIntegrationGateway.ts';
import { adminLocalAgentGateway } from './adminLocalAgentGateway.ts';
import { adminOperationsGateway } from './adminOperationsGateway.ts';
import { adminPrepStationGateway } from './adminPrepStationGateway.ts';
import { adminReportGateway } from './adminReportGateway.ts';
import { adminRestaurantGateway } from './adminRestaurantGateway.ts';
import { adminTableSessionGateway } from './adminTableSessionGateway.ts';
import { adminTariffGateway } from './adminTariffGateway.ts';
import { adminZoneGateway } from './adminZoneGateway.ts';

export const apiClient = {
  ...adminBusinessPartnerGateway,
  ...adminCashDeskGateway,
  ...adminCatalogGateway,
  ...adminDistributionPointGateway,
  ...adminDiningTableGateway,
  ...adminHallGateway,
  ...adminIdentityGateway,
  ...adminIntegrationGateway,
  ...adminLocalAgentGateway,
  ...adminOperationsGateway,
  ...adminPrepStationGateway,
  ...adminReportGateway,
  ...adminRestaurantGateway,
  ...adminTableSessionGateway,
  ...adminTariffGateway,
  ...adminZoneGateway,
};
