import { describe, expect, it } from 'vitest';

import ruCommon from './langs/ru/common.json';
import ruMessages from './langs/ru/messages.json';
import ruSecurity from './langs/ru/security-center.json';
import ruUsers from './langs/ru/users.json';
import uzCommon from './langs/uz/common.json';
import uzMessages from './langs/uz/messages.json';
import uzSecurity from './langs/uz/security-center.json';
import uzUsers from './langs/uz/users.json';
import uzCyrlCommon from './langs/uz-Cyrl/common.json';
import uzCyrlMessages from './langs/uz-Cyrl/messages.json';
import uzCyrlSecurity from './langs/uz-Cyrl/security-center.json';
import uzCyrlUsers from './langs/uz-Cyrl/users.json';

const resources = [
  { common: uzCommon, messages: uzMessages, security: uzSecurity, users: uzUsers },
  { common: uzCyrlCommon, messages: uzCyrlMessages, security: uzCyrlSecurity, users: uzCyrlUsers },
  { common: ruCommon, messages: ruMessages, security: ruSecurity, users: ruUsers },
] as const;

const rolloutReasonKeys = [
  'activePOSDevicesMissing',
  'agentDeviceNotActive',
  'agentDeviceNotMigrated',
  'agentMissing',
  'agentOffline',
  'bridgeBuildTimestampInvalid',
  'bridgeCapabilityMissing',
  'bridgeCheckInInvalid',
  'bridgeCheckInMissing',
  'bridgeDeadlineInvalid',
  'bridgeExpired',
  'bridgeFailureUnknown',
  'bridgeHeartbeatInvalid',
  'bridgeHeartbeatMissing',
  'bridgeNotConfigured',
  'bridgeNotEnabled',
  'bridgeServerNotReady',
  'bridgeSourceCommitInvalid',
  'migrationCountsInvalid',
  'unboundPOSSessions',
] as const;

describe('localization keys used by shared actions', () => {
  it.each(resources)('provides user status action labels', ({ users }) => {
    expect(users.actions.activate).toBeTruthy();
    expect(users.actions.deactivate).toBeTruthy();
  });

  it.each(resources)('provides notification action labels', ({ common }) => {
    expect(common.actions.accept).toBeTruthy();
    expect(common.actions.decline).toBeTruthy();
    expect(common.actions.reply).toBeTruthy();
    expect(common.actions.download).toBeTruthy();
    expect(common.actions.pay).toBeTruthy();
  });

  it.each(resources)('provides notification content labels', ({ messages }) => {
    expect(messages.notifications.project.feedback).toBeTruthy();
    expect(messages.notifications.tags.design).toBeTruthy();
    expect(messages.notifications.tags.dashboard).toBeTruthy();
    expect(messages.notifications.tags.designSystem).toBeTruthy();
  });

  it.each(resources)('provides every branch rollout readiness label', ({ security }) => {
    expect(Object.keys(security.readiness.reasons).sort()).toEqual([...rolloutReasonKeys].sort());
    expect(Object.keys(security.readiness.statuses).sort()).toEqual(
      ['fullyMigrated', 'notFullyMigrated', 'notReady', 'notRequired', 'ready'].sort(),
    );
    expect(Object.keys(security.readiness.stages).sort()).toEqual(
      ['fixPrerequisites', 'migrationInProgress', 'readyForBridgeOff', 'readyForPOSUpdate'].sort(),
    );
    expect(Object.keys(security.readiness.nextActions).sort()).toEqual(Object.keys(security.readiness.stages).sort());
  });
});
