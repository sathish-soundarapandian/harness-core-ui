/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import CommonHealthSource from './CommonHealthSource'
import { createHealthSourceData } from './CommonHealthSource.utils'
import type { CommonHealthSourceConfigurations, HealthSourceConfig } from './CommonHealthSource.types'

export interface CommonHealthSourceContainerProps {
  // TODO - type will be added once the backend entities are available
  data: any
  onSubmit: (formdata: any, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
}

export default function CommonHealthSourceContainer(props: CommonHealthSourceContainerProps): JSX.Element {
  const { data: sourceData, isTemplate, expressions, healthSourceConfig } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const handleSubmit = () => {
    // TODO will be implemented
  }

  return (
    <CommonHealthSource
      // TODO - will be a common method to create the initial data for the form.
      data={createHealthSourceData(sourceData)}
      onSubmit={handleSubmit}
      onPrevious={(formikValues: CommonHealthSourceConfigurations) => {
        onPrevious({ ...sourceData, ...formikValues })
      }}
      isTemplate={isTemplate}
      expressions={expressions}
      healthSourceConfig={healthSourceConfig}
    />
  )
}
