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

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ConfigFiles } from '../SshConfigFiles/ConfigFiles'

describe('<ConfigFiles /> tests', () => {
  test('render Ssh ConfigFiles', () => {
    const { container } = render(
      <TestWrapper>
        <ConfigFiles
          readonly={false}
          configFileSourceBaseFactory={configFileSourceBaseFactory}
          configFiles={[
            {
              configFile: {
                identifier: 'a411',
                spec: { store: { spec: { files: ['account:/v14'] }, type: 'Harness' } }
              }
            }
          ]}
          stageIdentifier="a1"
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
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
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    expect(container).toBeInTheDocument()
  })
})
