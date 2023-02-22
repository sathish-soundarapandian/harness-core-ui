/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useCallback } from 'react'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { createNewRelicData, createNewRelicPayload } from './NewRelicHealthSourceContainer.util'
import NewRelicHealthSource from './NewRelicHealthSource'

interface NewRelicHealthSource {
  data: any
  onSubmit: (formdata: any, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
}

export default function NewrelicMonitoredSourceContainer(props: NewRelicHealthSource): JSX.Element {
  const { data: sourceData, onSubmit, isTemplate, expressions } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const handleSubmit = useCallback(
    async (formValues: UpdatedHealthSource) => {
      const newRelicPayload = createNewRelicPayload(formValues)
      if (newRelicPayload) {
        await onSubmit(sourceData, newRelicPayload)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceData]
  )

  return (
    <>
      <NewRelicHealthSource
        data={createNewRelicData(sourceData)}
        onSubmit={handleSubmit}
        onPrevious={() => onPrevious(sourceData)}
        isTemplate={isTemplate}
        expressions={expressions}
      />
    </>
  )
}
