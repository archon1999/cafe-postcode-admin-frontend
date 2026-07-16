import type { TFunction } from 'i18next';

export const getFieldLabel = (
  field: string,
  t: TFunction,
  _tabType: 'general' | 'equipment' | 'recurring' = 'general',
): string => {
  const fieldLabels: Record<string, string> = {
    first_name: t('view.labels.firstName'),
    last_name: t('view.labels.lastName'),
    contact_number: t('view.labels.contactNumber'),
    telegram_number: t('view.labels.telegramNumber'),
    email: t('view.labels.email'),
    birth_date: t('view.labels.birthDate'),
    emergency_first_name: t('view.labels.firstName'),
    emergency_last_name: t('view.labels.lastName'),
    emergency_contact_number: t('view.labels.emergencyContact'),
    emergency_relationship: t('personalInfo.fields.emergencyRelationship'),
    address: t('view.labels.address'),
    address2: t('view.labels.address2'),
    city: t('view.labels.city'),
    state: t('view.labels.state'),
    country: t('view.labels.country'),
    zip_code: t('view.labels.zipCode'),
    hired_date: t('view.labels.hiredDate'),
    statement_email: t('list.columns.statementEmail'),

    role_type: t('view.labels.driverRole'),
    payment_type: t('view.labels.paymentType'),
    payment_flat_amount: t('view.labels.payment'),
    payment_percentage: t('view.labels.payment'),
    payment_gross_share: t('view.labels.grossShare'),
    type: t('view.labels.driverType'),
    payment_empty_mile: t('view.labels.showTripsEmptyMileage'),
    payment_loaded_mile: t('view.labels.showTripsLoadedMileage'),
    payment_days_of_work: t('view.labels.paymentDaysOfWork'),
    payment_hourly_rate: t('view.labels.paymentHourlyRate'),

    deduct_fuel: t('stepThree.deductions.fuel'),
    deduct_toll: t('stepThree.deductions.toll'),
    deduct_misc: t('stepThree.deductions.misc'),
    reimburse_refunded_amount: t('stepThree.deductions.reimburse'),
    fuel_discount_value: t('view.labels.fuelDiscountReward'),
    truck: t('view.labels.truck'),
    trailer: t('view.labels.trailer'),
    fuel_discount_type: t('view.labels.fuelDiscountType'),
    inventories: t('view.labels.inventories'),

    administration_fee: t('view.labels.administrationFee'),
    cargo_liability_fee: t('view.labels.cargoLiability'),
    eld_device_fee: t('view.labels.eldDeviceFee'),
    ifta_fee: t('view.labels.iftaFee'),
    occ_acc_fee: t('view.labels.occac'),
    physical_damage: t('view.labels.physicalDamage'),
    pre_pass_fee: t('view.labels.prePassFee'),
    trailer_fee: t('stepFour.fields.trailerFee'),
    truck_fee: t('stepFour.fields.truckFee'),
    truck_fee_per_mile: t('stepFour.fields.truckFeePerMile'),
    depository_fund_total_amount: t('stepFour.fields.depositoryTotal'),
    depository_fund_split_into: t('stepFour.fields.depositorySplit'),
    depository_fund_prev_charged: t('stepFour.fields.depositoryPrev'),
    depository_fund_refund_after_termination: t('stepFour.fields.depositoryRefundAfter'),
  };

  return (
    fieldLabels[field] || t(`view.labels.${field}`) || field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
};
