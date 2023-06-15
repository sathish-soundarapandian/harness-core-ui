import { act, fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import KuberntesManifestSizingTable from '../components/KuberntesManifestSizingTable'

describe('sizing table', () => {
  test('sizing table', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <KuberntesManifestSizingTable delegateType={'test delegate'} />
      </TestWrapper>
    )
    expect(getByText('delegates.commandLineCreation.delegateSizing')).toBeTruthy()
    await act(async () => {
      fireEvent.click(getByText('delegates.commandLineCreation.delegateSizing'))
    })
    await waitFor(() => {
      expect(getByText('delegates.commandLineCreation.replicas')).toBeDefined()
    })
    expect(getByText('delegates.commandLineCreation.replicas')).toBeDefined()
    await act(async () => {
      fireEvent.click(getByText('close'))
    })
    expect(container).toMatchSnapshot()
  })
})
