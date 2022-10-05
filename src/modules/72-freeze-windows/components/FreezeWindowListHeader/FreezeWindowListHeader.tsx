/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { HarnessDocTooltip, Page, Switch } from '@harness/uicore'
import { noop } from 'lodash-es'
import React, { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'

export function FreezeWindowListHeader(): ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  // TODO: integrate global toggle handling here
  const onGlobalFreezeToggle = noop
  const GLOBAL_FREEZE = false
  return (
    <Page.Header
      title={
        <div className="ng-tooltip-native">
          <h2 data-tooltip-id="freezeWindowsPageHeading"> {getString('common.freezeWindows')}</h2>
          <HarnessDocTooltip tooltipId="freezeWindowsPageHeading" useStandAlone={true} />
        </div>
      }
      breadcrumbs={
        <NGBreadcrumbs links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })} />
      }
      toolbar={
        GLOBAL_FREEZE && (
          <Switch
            large
            checked
            label={getString('freezeWindows.disableAllDeployments')}
            onChange={() => onGlobalFreezeToggle()}
          />
        )
      }
    />
  )
}
