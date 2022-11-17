/* eslint-disable no-restricted-imports */
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
import { ApplicationConfigBaseFactory } from '@cd/factory/ApplicationConfigFactory/ApplicationConfigFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ApplicationConfigType } from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceSpecInterface.types'
import { template, startupCommand, applicationSettings, connectionStrings } from './mocks'
import { RuntimeApplicationConfig } from '../RuntimeApplicationConfig'

describe('Azure Web App config tests', () => {
  test('Should match snapshot for startup script', () => {
    const { container } = render(
      <TestWrapper>
        <RuntimeApplicationConfig
          initialValues={{ startupCommand: startupCommand as StartupCommandConfiguration }}
          template={template as ServiceSpec}
          applicationConfig={startupCommand as StartupCommandConfiguration}
          readonly
          stageIdentifier="stage-0"
          applicationConfigBaseFactory={new ApplicationConfigBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          type={ApplicationConfigType.startupCommand}
          stepViewType={StepViewType.InputSet}
          path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for application settings', () => {
    const { container } = render(
      <TestWrapper>
        <RuntimeApplicationConfig
          initialValues={{ applicationSettings: applicationSettings as ApplicationSettingsConfiguration }}
          template={template as ServiceSpec}
          applicationConfig={applicationSettings as ApplicationSettingsConfiguration}
          readonly
          stageIdentifier="stage-0"
          applicationConfigBaseFactory={new ApplicationConfigBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          type={ApplicationConfigType.applicationSettings}
          stepViewType={StepViewType.InputSet}
          path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should match snapshot for connection strings', () => {
    const { container } = render(
      <TestWrapper>
        <RuntimeApplicationConfig
          initialValues={{ connectionStrings: connectionStrings as ConnectionStringsConfiguration }}
          template={template as ServiceSpec}
          applicationConfig={connectionStrings as ConnectionStringsConfiguration}
          readonly
          stageIdentifier="stage-0"
          applicationConfigBaseFactory={new ApplicationConfigBaseFactory()}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          type={ApplicationConfigType.connectionStrings}
          stepViewType={StepViewType.InputSet}
          path="stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
