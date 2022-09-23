/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type {
  ApplicationSettingsConfiguration,
  ConnectionStringsConfiguration,
  ServiceSpec,
  StartupCommandConfiguration
} from 'services/cd-ng'
import { AzureWebAppConfigBaseFactory } from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { template, startupCommand, applicationSettings, connectionStrings } from './mocks'
import { AzureWebAppConfig } from '../RuntimeAzureWebAppConfig'
import { AzureWebAppConfigType } from '../../AzureWebAppServiceSpecInterface.types'

describe('Azure Web App config tests', () => {
  test('Should match snapshot for startup script', () => {
    const { container } = render(
      <TestWrapper>
        <AzureWebAppConfig
          initialValues={{ startupCommand: startupCommand as StartupCommandConfiguration }}
          template={template as ServiceSpec}
          azureWebAppConfig={startupCommand as StartupCommandConfiguration}
          readonly
          stageIdentifier="stage-0"
          azureWebAppConfigBaseFactory={new AzureWebAppConfigBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          type={AzureWebAppConfigType.startupCommand}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for application settings', () => {
    const { container } = render(
      <TestWrapper>
        <AzureWebAppConfig
          initialValues={{ applicationSettings: applicationSettings as ApplicationSettingsConfiguration }}
          template={template as ServiceSpec}
          azureWebAppConfig={applicationSettings as ApplicationSettingsConfiguration}
          readonly
          stageIdentifier="stage-0"
          azureWebAppConfigBaseFactory={new AzureWebAppConfigBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          type={AzureWebAppConfigType.applicationSettings}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for connection strings', () => {
    const { container } = render(
      <TestWrapper>
        <AzureWebAppConfig
          initialValues={{ connectionStrings: connectionStrings as ConnectionStringsConfiguration }}
          template={template as ServiceSpec}
          azureWebAppConfig={connectionStrings as ConnectionStringsConfiguration}
          readonly
          stageIdentifier="stage-0"
          azureWebAppConfigBaseFactory={new AzureWebAppConfigBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          type={AzureWebAppConfigType.connectionStrings}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
