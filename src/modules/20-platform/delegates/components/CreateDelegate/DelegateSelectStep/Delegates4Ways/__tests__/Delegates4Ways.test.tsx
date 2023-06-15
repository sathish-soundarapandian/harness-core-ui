/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Delegates4Ways from '../Delegates4Ways'

const onSelect = jest.fn()

const selectCardData = [
  {
    text: 'Runs Harness Delegate as a Docker container on any Linux or Mac',
    value: 'service-docker',
    icon: 'docker-icon',
    name: 'Docker',
    type: 'DOCKER'
  },
  {
    text: 'Runs Harness Delegate as a Kubernetes',
    value: 'service-k8s',
    icon: 'k8s-icon',
    name: 'Kubernetes',
    type: 'K8sCluster'
  }
]

describe('Render Delegates4Ways', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <Delegates4Ways onSelect={onSelect} selectedCard={selectCardData[0]} selectCardData={selectCardData} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
