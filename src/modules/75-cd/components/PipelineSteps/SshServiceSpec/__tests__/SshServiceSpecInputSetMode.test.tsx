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

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { SshServiceSpecInputSetMode } from '../SshServiceSpecInputSetMode'

describe('<SshServiceSpecInputSetMode /> tests', () => {
  test('render for Ssh service spec input set mode', () => {
    const { container } = render(
      <TestWrapper>
        <SshServiceSpecInputSetMode
          stageIdentifier="a1"
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          initialValues={{}}
          allValues={{
            artifacts: {
              primary: {
                type: 'Nexus3Registry',
                spec: {}
              }
            }
          }}
          template={{
            configFiles: [
              {
                configFile: {
                  identifier: 'a11',
                  spec: { store: { spec: { files: ['account:/v1'] }, type: 'Harness' } }
                }
              }
            ],
            manifests: [
              {
                manifest: {
                  identifier: 'm1',
                  spec: {},
                  type: 'Values'
                }
              }
            ],

            variables: [
              {
                type: 'String',
                description: 'SshVariable'
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
