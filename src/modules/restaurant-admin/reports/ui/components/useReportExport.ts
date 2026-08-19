import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import type { AdminReceiptStatus } from 'shared/api/admin-types';
import { downloadBlob } from 'shared/utils/download';

import { reportsRepository } from '../../data-access';

import type { TableReportKey } from './reportTableColumns';

type Options = {
  reportKey: TableReportKey;
  startDate: string;
  endDate: string;
  search: string;
  ordering?: string;
  paymentMethod?: string;
  receiptStatus?: AdminReceiptStatus;
  receiptKind?: 'plain' | 'fiscal';
  categoryId?: string;
  cashDeskId?: string;
  cashierId?: string;
  shiftStatus?: string;
  differenceOnly: boolean;
};

export function useReportExport(options: Options) {
  const { t } = useTranslate('reports');
  const [exportLoading, setExportLoading] = useState(false);

  const exportReport = async () => {
    setExportLoading(true);
    const commonParams = {
      startDate: options.startDate,
      endDate: options.endDate,
      search: options.search || undefined,
      ordering: options.ordering,
    };

    try {
      const result =
        options.reportKey === 'sales'
          ? await reportsRepository.exportSales({ ...commonParams, paymentMethod: options.paymentMethod })
          : options.reportKey === 'receipts'
            ? await reportsRepository.exportReceipts({
                ...commonParams,
                status: options.receiptStatus,
                receiptKind: options.receiptKind,
              })
            : options.reportKey === 'topItems'
              ? await reportsRepository.exportTopItems({ ...commonParams, categoryId: options.categoryId })
              : options.reportKey === 'topStaff'
                ? await reportsRepository.exportTopStaff(commonParams)
                : options.reportKey === 'shifts'
                  ? await reportsRepository.exportShifts({
                      ...commonParams,
                      cashDeskId: options.cashDeskId,
                      cashierId: options.cashierId,
                      status: options.shiftStatus,
                      differenceOnly: options.differenceOnly,
                    })
                  : await reportsRepository.exportPaymentBreakdown({
                      ...commonParams,
                      paymentMethod: options.paymentMethod,
                    });

      downloadBlob(result.blob, result.filename);
    } catch {
      toast.error(t('errors.exportFailed'));
    } finally {
      setExportLoading(false);
    }
  };

  return { exportLoading, exportReport };
}
