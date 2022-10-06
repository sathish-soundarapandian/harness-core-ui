/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'
import { GroupByDropDown, LabelDropDown } from '../GroupByView'

const ClusterData = {
  identifier: 'CLUSTER',
  identifierName: 'Cluster',
  values: [
    {
      fieldId: 'clusterName',
      fieldName: 'Cluster Name',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'namespace',
      fieldName: 'Namespace',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'namespace',
      fieldName: 'Namespace Id',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'workloadName',
      fieldName: 'Workload',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'workloadName',
      fieldName: 'Workload Id',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    }
  ],
  __typename: 'QLCEViewFieldIdentifierData'
}

describe('test cases for groupby views', () => {
  test('should be able to render group by view popover', async () => {
    const { container } = render(
      <GroupByDropDown
        isBusinessMapping={false}
        openBusinessMappingDrawer={jest.fn()}
        setGroupBy={jest.fn()}
        data={ClusterData as QlceViewFieldIdentifierData}
        canAddCostCategory={false}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render label view popover', async () => {
    const { container } = render(
      <TestWrapper>
        <LabelDropDown setGroupBy={jest.fn()} data={['value1', 'value2', 'value3', 'value4', 'value5', 'value6']} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
