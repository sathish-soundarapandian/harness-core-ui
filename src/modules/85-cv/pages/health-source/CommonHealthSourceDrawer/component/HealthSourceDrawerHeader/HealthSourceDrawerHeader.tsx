/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './HealthSourceDrawerHeader.module.scss'

export default function HealthSourceDrawerHeader({
  isEdit,
  breadCrumbRoute,
  onClick
}: {
  isEdit?: boolean
  onClick?: () => void
  shouldRenderAtVerifyStep?: boolean
  breadCrumbRoute?: {
    routeTitle: string
  }
}): JSX.Element {
  const { getString } = useStrings()
  const { routeTitle } = breadCrumbRoute || { routeTitle: getString('cv.healthSource.backtoMonitoredService') }
  return (
    <>
      <Text
        className={css.breadCrumbLink}
        style={{ cursor: 'pointer' }}
        icon={'arrow-left'}
        iconProps={{ color: Color.PRIMARY_7, margin: { right: 'small' } }}
        color={Color.PRIMARY_7}
        onClick={onClick}
      >
        {routeTitle}
      </Text>
      <div className="ng-tooltip-native">
        <p>{isEdit ? getString('cv.healthSource.editHealthSource') : getString('cv.healthSource.addHealthSource')}</p>
      </div>
    </>
  )
}
