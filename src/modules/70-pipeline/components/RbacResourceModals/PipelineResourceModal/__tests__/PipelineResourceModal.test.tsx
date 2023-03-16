/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { pipelines } from '@pipeline/components/PipelineModalListView/__tests__/pipelinelistMocks'
import { SortMethod } from '@common/utils/sortUtils'
import PipelineResourceModal from '../PipelineResourceModal'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

const params = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  pipelineIdentifier: 'pipelineIdentifier',
  module: 'cd'
}
jest.mock('@common/utils/dateUtils', () => ({
  formatDatetoLocale: (x: number) => x
}))
jest.useFakeTimers()

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn(() => ({
    mutate: jest.fn().mockResolvedValue(pipelines),
    cancel: jest.fn(),
    loading: false
  }))
}))

describe('PipelineModal List View', () => {
  test('render list view', async () => {
    render(
      <TestWrapper pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <PipelineResourceModal {...props}></PipelineResourceModal>
      </TestWrapper>
    )
    expect(
      await screen.findByRole('link', {
        name: /Sonar Develop/i
      })
    ).toBeInTheDocument()
  })
})
