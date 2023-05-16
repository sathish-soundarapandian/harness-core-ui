/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText } from '@testing-library/react'
import { Color } from '@harness/design-system'
import { TestWrapper } from '@common/utils/testUtils'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { ToolTipProps } from '../EnvironmentToolTipDisplay';
import { EnvironmentToolTipDisplay } from '../EnvironmentToolTipDisplay'

const Wrapper = (props: ToolTipProps): JSX.Element => {
  return (
    <TestWrapper>
      <EnvironmentToolTipDisplay {...props} />
    </TestWrapper>
  )
}

describe('EnvironmentSelectOrCreate', () => {
  test('Should render ToolTip Display component', async () => {
    const { container } = render(
      <Wrapper
        color={Color.AQUA_500}
        font={''}
        type={ChangeSourceCategoryName.INFRASTRUCTURE}
        envRefList={['env']}
        shouldAddEnvPrefix
      />
    )

    const ele = await findByText(container, 'environment: env')

    expect(ele).toBeInTheDocument()
  })

  test('Should render ToolTip Display component with shouldAddEnvPrefix as false', async () => {
    const { container } = render(
      <Wrapper
        color={Color.AQUA_500}
        font={''}
        type={ChangeSourceCategoryName.INFRASTRUCTURE}
        envRefList={['env']}
        shouldAddEnvPrefix={false}
      />
    )

    const ele = await findByText(container, 'env')

    expect(ele).toBeInTheDocument()
  })

  test('If not Infrastructure then it should render the data from envRef', async () => {
    const { container } = render(
      <Wrapper
        color={Color.AQUA_500}
        font={''}
        type={ChangeSourceCategoryName.ALERT}
        environmentRef={'env'}
        shouldAddEnvPrefix
      />
    )

    const ele = await findByText(container, 'environment: env')

    expect(ele).toBeInTheDocument()
  })
})
