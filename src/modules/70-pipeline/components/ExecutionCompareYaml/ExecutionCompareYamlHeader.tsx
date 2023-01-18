/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation } from '@harness/design-system'
import { Button, ButtonVariation, Layout, Page, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { useStrings } from 'framework/strings'
import { useBooleanStatus } from '@common/hooks'
import { useExecutionCompareContext } from './ExecutionCompareContext'
import { ExecutionCompareYaml } from './ExecutionCompareYaml'

export function ExecutionCompareYamlHeader(): ReactElement {
  const { cancelCompareMode, compareItems } = useExecutionCompareContext()
  const { state: showCompareExecutionDrawer, close, open } = useBooleanStatus(false)
  const { getString } = useStrings()

  return (
    <>
      <Page.SubHeader>
        <Text font={{ variation: FontVariation.LEAD }}>{getString('pipeline.execution.compareExecutionsTitle')}</Text>
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Button
            text={getString('pipeline.execution.compareAction')}
            variation={ButtonVariation.PRIMARY}
            onClick={() => open()}
            disabled={compareItems.length < 2}
          />
          <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => cancelCompareMode()} />
        </Layout.Horizontal>
      </Page.SubHeader>
      {showCompareExecutionDrawer && (
        <ExecutionCompareYaml
          compareItems={compareItems}
          onClose={() => {
            close()
            cancelCompareMode()
          }}
        />
      )}
    </>
  )
}
