/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Popover } from '@harness/uicore'
import { String as StrTemplate } from 'framework/strings'
import type { Application } from 'services/cd-ng'
import type { StageDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { ServicePopoverCard } from '@cd/components/ServicePopoverCard/ServicePopoverCard'
import serviceCardCSS from '@cd/components/ServicePopoverCard/ServicePopoverCard.module.scss'
import css from './CDStageDetails.module.scss'

const GitopsApplications = ({ gitOpsApps }: { gitOpsApps: Application[] }): React.ReactElement | null => {
  if (gitOpsApps.length === 0) return null

  return (
    <div data-test-id="GitopsApplications">
      <StrTemplate className={css.title} tagName="div" stringID="applications" />
      <ul className={css.values}>
        <li>
          {gitOpsApps[0].name}
          {gitOpsApps.length > 1 ? (
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              className={css.serviceWrapper}
              position={Position.BOTTOM_RIGHT}
            >
              <span>,&nbsp;+{Math.abs(gitOpsApps.length - 1)}</span>
              <div className={serviceCardCSS.main}>
                <ul className={css.values}>
                  {gitOpsApps.slice(1).map((app: Application, index: number) => {
                    return <li key={app.identifier || index}>{app.name}</li>
                  })}
                </ul>
              </div>
            </Popover>
          ) : null}
        </li>
      </ul>
    </div>
  )
}

export function CDStageDetails(props: StageDetailProps): React.ReactElement {
  const { stage } = props
  const gitOpsApps = get(stage, 'moduleInfo.cd.gitOpsAppSummary.applications') || []
  return (
    <div className={css.container}>
      <div className={cx(css.main, { [css.threeSections]: !!gitOpsApps.length })}>
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
        <GitopsApplications gitOpsApps={gitOpsApps} />
      </div>
    </div>
  )
}
