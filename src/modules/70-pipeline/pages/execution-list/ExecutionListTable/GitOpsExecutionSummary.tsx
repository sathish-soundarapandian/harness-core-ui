/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { Icon, Layout, Popover, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Application } from 'services/cd-ng'

function GitOpsExecutionSummary({ stageInfo, limit = 1 }: { stageInfo: Record<string, any>; limit?: number }) {
  const { getString } = useStrings()
  const gitOpsApplications = stageInfo.gitOpsAppSummary?.applications || []

  return gitOpsApplications.length ? (
    <Layout.Horizontal>
      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
        <Icon name="gitops-application" size={14} />
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {getString('applications')}:
        </Text>
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
          {gitOpsApplications.slice(0, limit).map((app: Application, index: number) => {
            return (
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800} key={app.identifier || index}>
                {app.name}
              </Text>
            )
          })}
        </Text>
        {gitOpsApplications.length > limit ? (
          <>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              className={Classes.DARK}
              content={
                <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500 }}>
                  {gitOpsApplications.slice(limit).map((app: Application, index: number) => {
                    return (
                      <Text
                        font={{ variation: FontVariation.SMALL_SEMI }}
                        color={Color.WHITE}
                        key={app.identifier || index}
                      >
                        {app.name}
                      </Text>
                    )
                  })}
                </Layout.Vertical>
              }
            >
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
                ,&nbsp;+{Math.abs(gitOpsApplications.length - limit)}
              </Text>
            </Popover>
          </>
        ) : null}
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : null
}

export default GitOpsExecutionSummary
