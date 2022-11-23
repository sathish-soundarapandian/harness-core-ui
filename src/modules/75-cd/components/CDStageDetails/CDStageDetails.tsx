/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Position } from '@blueprintjs/core'
import { Popover } from '@harness/uicore'

import { String as StrTemplate } from 'framework/strings'
import type { StageDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { ServicePopoverCard } from '@cd/components/ServicePopoverCard/ServicePopoverCard'

import css from './CDStageDetails.module.scss'

export function CDStageDetails(props: StageDetailProps): React.ReactElement {
  const { stage } = props

  return (
    <div className={css.container}>
      <div className={css.main}>
        <div>
          <StrTemplate className={css.title} tagName="div" stringID="serviceOrServices" />
          <ul className={css.values}>
            <li>
              <Popover
                wrapperTagName="div"
                targetTagName="div"
                interactionKind="hover"
                position={Position.BOTTOM_RIGHT}
                className={css.serviceWrapper}
              >
                <div className={css.serviceName}>{get(stage, 'moduleInfo.cd.serviceInfo.displayName', null)}</div>
                <ServicePopoverCard service={get(stage, 'moduleInfo.cd.serviceInfo')} />
              </Popover>
            </li>
          </ul>
        </div>
        <div>
          <StrTemplate className={css.title} tagName="div" stringID="environmentOrEnvironments" />
          <ul className={css.values}>
            <li>{get(stage, 'moduleInfo.cd.infraExecutionSummary.name', null)}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
