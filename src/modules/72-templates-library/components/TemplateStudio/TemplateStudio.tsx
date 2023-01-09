/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Callout } from '@blueprintjs/core'
import { Button, ButtonSize, ButtonVariation, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { TemplateStudioInternal } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { TemplateProvider } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type {
  GitQueryParams,
  ModulePathParams,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import css from './TemplateStudio.module.scss'

export function TemplateStudio(): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, templateType, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { versionLabel, repoIdentifier, branch } = useQueryParams<TemplateStudioQueryParams & GitQueryParams>()
  const [showBanner, setShowBanner] = useState(true)

  return (
    <>
      {showBanner && (
        <Callout className={css.callout} intent="success" icon={null}>
          <Text color={Color.BLACK}>
            Harness has made a significant update to the services and environments in CD. Services and Environments now
            have definitions that are associated with the respective object and can be managed independent of the
            pipeline. This change is a forward looking change that won’t impact your existing pipelines. However, we do
            plan on reducing our support on the service v1 and environments v1 and plan to deprecate by end of January.
            We have an automated migration tool to support our users. Please contact
            <a href="https://support.harness.io/hc/en-us" target="_blank" rel="noreferrer">
              <b>&nbsp;support.harness.io&nbsp;</b>
            </a>
            for further questions.
          </Text>
          <Button
            variation={ButtonVariation.ICON}
            size={ButtonSize.LARGE}
            icon="cross"
            onClick={() => setShowBanner(false)}
          />
        </Callout>
      )}
      <TemplateProvider
        queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
        module={module}
        templateIdentifier={templateIdentifier}
        versionLabel={versionLabel}
        templateType={templateType}
      >
        <GitSyncStoreProvider>
          <TemplateStudioInternal />
        </GitSyncStoreProvider>
      </TemplateProvider>
    </>
  )
}
