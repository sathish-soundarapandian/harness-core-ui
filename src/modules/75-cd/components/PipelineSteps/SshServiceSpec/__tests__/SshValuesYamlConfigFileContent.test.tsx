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
import configFileSourceBaseFactory from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBaseFactory'

import SshValuesYamlConfigFileContent from '../ConfigFileSource/ConfigFileSourceRuntimeFields/SshValuesYamlConfigFileContent'

describe('<SshValuesYamlConfigFileContent /> tests', () => {
  test('render SshValuesYamlConfigFileContent', () => {
    const { container } = render(
      <TestWrapper>
        <SshValuesYamlConfigFileContent
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          isConfigFileRuntime={true}
          projectIdentifier="a1"
          orgIdentifier="a2"
          accountId="a3"
          pipelineIdentifier="a4"
          repoIdentifier="a5"
          pathFieldlabel="save"
          configFileSourceBaseFactory={configFileSourceBaseFactory}
          readonly={false}
          stageIdentifier="a6"
          initialValues={{
            deploymentType: 'Ssh'
          }}
          template={{
            configFiles: [
              {
                configFile: {
                  identifier: 'a11',
                  spec: { store: { spec: { files: ['account:/v1'] }, type: 'Harness' } }
                }
              }
            ]
          }}
        />
      </TestWrapper>
    )
    expect(container).toBeInTheDocument()
  })
})
