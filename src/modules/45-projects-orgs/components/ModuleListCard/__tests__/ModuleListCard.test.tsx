/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleListCard from '../ModuleListCard'

const moduleList: ModuleName[] = [
  ModuleName.CD,
  ModuleName.CV,
  ModuleName.CE,
  ModuleName.CF,
  ModuleName.CI,
  ModuleName.CHAOS
]

describe('Project Details', () => {
  test('render', async () => {
    moduleList.map(value => {
      const { container } = render(
        <TestWrapper
          path="/account/:accountId/org/:orgIdentifier/project/:projectIdentifier"
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
        >
          <ModuleListCard projectIdentifier="Portal" orgIdentifier="Cisco_Meraki" module={value} accountId="testAcc" />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
