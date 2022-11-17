/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { isUndefined } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { DelegateTypes } from '@delegates/constants'
import type { DelegateGroupDetails } from 'services/portal'
import { statusLabels, statusTypes } from '../Delegate.constants'

export const GetDelegateTitleTextByType = (type: string): string => {
  const { getString } = useStrings()

  switch (type) {
    case DelegateTypes.KUBERNETES_CLUSTER:
      return getString('kubernetesText')
    default:
      /* istanbul ignore next */
      return ''
  }
}

export const getDelegateStatusSelectOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return statusTypes.map((item: string) => ({
    label: getString(statusLabels[item]),
    value: item
  }))
}
enum InstanceStatus {
  EXPIRED = 'Expired',
  EXPIRING = 'Expiring',
  LATEST = 'latest',
  UPGRADE_REQUIRED = 'Upgrade Required'
}
export const getInstanceStatus = (delegate: DelegateGroupDetails): string => {
  const currentTime = Date.now()
  if (!isUndefined(delegate?.delegateGroupExpirationTime)) {
    if (!delegate?.immutable) {
      return InstanceStatus.LATEST
    } else if (delegate?.immutable && delegate?.groupVersion?.startsWith('1.0')) return InstanceStatus.UPGRADE_REQUIRED
    else if (currentTime > delegate?.delegateGroupExpirationTime) return InstanceStatus.EXPIRED
    else return `${InstanceStatus.EXPIRING} ${moment(delegate.delegateGroupExpirationTime).fromNow()}`
  }
  return ''
}

export const getAutoUpgradeTextColor = (autoUpgradeCondition: string | undefined): string[] => {
  switch (autoUpgradeCondition) {
    case 'SYNCHRONIZING':
      return [Color.ORANGE_400, 'SYNCHRONIZING']
    case 'ON':
      return [Color.GREEN_600, 'AUTO UPGRADE: ON']
    default:
      return [Color.GREY_300, 'AUTO UPGRADE: OFF']
  }
}
