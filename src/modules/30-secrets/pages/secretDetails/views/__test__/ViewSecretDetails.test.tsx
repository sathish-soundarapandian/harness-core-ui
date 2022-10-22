/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { VisualYamlSelectedView } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import ViewSecretDetails from '../ViewSecretDetails'

import mockData from '../../__test__/secretDetailsMocks.json'

describe('ViewSecretDetails', () => {
  test('Text Secret', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <ViewSecretDetails
          secret={mockData.text.data.data as any}
          handleEdit={jest.fn}
          setMode={jest.fn}
          mode={VisualYamlSelectedView.VISUAL}
          edit={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('SSH Secret', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <ViewSecretDetails
          secret={mockData.sshKey.data.data as any}
          handleEdit={jest.fn}
          setMode={jest.fn}
          mode={VisualYamlSelectedView.VISUAL}
          edit={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('WinRm Secret NTLM', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <ViewSecretDetails
          secret={mockData.winrm.data.data as any}
          handleEdit={jest.fn}
          setMode={jest.fn}
          mode={VisualYamlSelectedView.VISUAL}
          edit={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('WinRm Secret Kerberos', async () => {
    const secretMock = mockData.winrm.data.data.secret as any

    const secret = {
      ...secretMock,
      spec: {
        ...secretMock.spec,
        auth: {
          ...secretMock.spec.auth,
          type: 'Kerberos',
          spec: {
            ...secretMock.spec.auth.spec,
            domain: 'domain',
            principal: 'principal name',
            realm: 'realm'
          }
        }
      }
    }

    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <ViewSecretDetails
          secret={{ secret: secret }}
          handleEdit={jest.fn}
          setMode={jest.fn}
          mode={VisualYamlSelectedView.VISUAL}
          edit={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
