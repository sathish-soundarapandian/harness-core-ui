/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getAllByTestId, getByTestId, getByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CDInfo, { CDInfoProps } from '../CDInfo'

const getProps = (): CDInfoProps => ({
  data: null,
  barrier: {
    barrierInfoLoading: false,
    barrierData: null
  }
})

const serviceEnvProps = (): CDInfoProps => ({
  data: {
    data: {
      moduleInfo: {
        cd: {
          serviceInfo: {
            displayName: 'ServiceA',
            artifacts: {
              sidecars: [],
              primary: {
                imagePath: 'test-image'
              }
            }
          },
          infraExecutionSummary: {
            name: 'infra1',
            infrastructureIdentifier: 'infrastructure-1'
          }
        }
      }
    }
  }
})

describe('CDInfo', () => {
  test('matches snapshot when no data', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <CDInfo {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when service, environment are available on data', () => {
    const props = serviceEnvProps()
    const { container } = render(
      <TestWrapper>
        <CDInfo {...props} />
      </TestWrapper>
    )

    expect(getByText(container, 'serviceOrServices')).toBeInTheDocument()

    const textElement = getByTestId(container, 'hovercard-service')
    expect(textElement.textContent).toBe('ServiceA')

    expect(getByText(container, 'environmentOrEnvironments')).toBeInTheDocument()

    const envElement = getByTestId(container, 'hovercard-environment')
    expect(envElement.textContent).toBe('infra1')

    expect(getByText(container, 'infrastructureText')).toBeInTheDocument()

    const infraElement = getByTestId(container, 'hovercard-infraStructure')
    expect(infraElement.textContent).toBe('infrastructure-1')

    expect(getByText(container, 'artifactOrArtifacts')).toBeInTheDocument()

    const artifacts = getAllByTestId(container, 'hovercard-artifacts')
    expect(artifacts[0].textContent).toBe('test-image')
  })
})
