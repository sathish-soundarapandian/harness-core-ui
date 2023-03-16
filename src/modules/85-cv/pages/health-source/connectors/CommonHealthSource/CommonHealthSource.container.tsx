/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext } from 'react'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ConnectorConfigureOptionsProps } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import CommonHealthSource from './CommonHealthSource'
import { createHealthSourcePayload, createHealthSourceConfigurationsData } from './CommonHealthSource.utils'
import type { CommonHealthSourceConfigurations, HealthSourceConfig } from './CommonHealthSource.types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { DefineHealthSourceFormInterface } from '../../HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.types'

export interface CommonHealthSourceContainerProps {
  data: DefineHealthSourceFormInterface
  onSubmit: (formdata: DefineHealthSourceFormInterface, updatedHealthSource: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
}

export default function CommonHealthSourceContainer(props: CommonHealthSourceContainerProps): JSX.Element {
  const { data: sourceData, isTemplate, expressions, healthSourceConfig, onSubmit } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const connectorIdentifier =
    (sourceData?.connectorRef as ConnectorConfigureOptionsProps)?.value ?? sourceData?.connectorRef

  const handleSubmit = useCallback(
    async (configureHealthSourceData: CommonHealthSourceConfigurations) => {
      const { product, sourceType, identifier, healthSourceName, healthSourceIdentifier } = sourceData || {}
      const defineHealthSourcedata = {
        product,
        sourceType,
        identifier,
        healthSourceName,
        connectorRef: connectorIdentifier,
        healthSourceIdentifier
      }
      const healthSourcePayload = createHealthSourcePayload(defineHealthSourcedata, configureHealthSourceData)
      await onSubmit(sourceData, healthSourcePayload)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceData]
  )

  return (
    <CommonHealthSource
      data={createHealthSourceConfigurationsData(sourceData)}
      onSubmit={handleSubmit}
      onPrevious={(formikValues: CommonHealthSourceConfigurations) => {
        onPrevious({ ...sourceData, ...formikValues })
      }}
      isTemplate={isTemplate}
      expressions={expressions}
      healthSourceConfig={healthSourceConfig}
      connectorRef={connectorIdentifier}
    />
  )
}
