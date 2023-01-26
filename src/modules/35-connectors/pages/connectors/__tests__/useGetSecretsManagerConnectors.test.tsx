/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { useGetSecretsManagerConnectorsHook } from '../hooks/useGetSecretsManagerConnectors/useGetSecretsManagerConnectors'

describe('useGetSecretsManagerConnectorsHook', () => {
  test('useGetSecretsManagerConnectorsHook render data, enabled ff', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(true)
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )

    const { result } = renderHook(useGetSecretsManagerConnectorsHook, { wrapper })

    const { secretsManager } = result.current
    expect(secretsManager).toHaveLength(7)
    expect(secretsManager).toEqual([
      'Vault',
      'AwsKms',
      'AzureKeyVault',
      'AwsSecretManager',
      'GcpKms',
      'CustomSecretManager',
      'GcpSecretManager'
    ])
  })
  test('useGetSecretsManagerConnectorsHook render data, disabled ff', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(false)
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )

    const { result } = renderHook(useGetSecretsManagerConnectorsHook, { wrapper })

    const { secretsManager } = result.current
    expect(secretsManager).toHaveLength(6)
    expect(secretsManager).toEqual([
      'Vault',
      'AwsKms',
      'AzureKeyVault',
      'AwsSecretManager',
      'GcpKms',
      'CustomSecretManager'
    ])
  })
})
