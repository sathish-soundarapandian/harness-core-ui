/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import { useGetPipelineInputs } from 'services/pipeline-ng'
import { useInputSetsV1 } from '../useInputSetsV1'
import type { useInputSetsV1Props } from '../useInputSetsV1'
jest.mock('services/pipeline-ng', () => ({
  useGetPipelineInputs: jest.fn(() => ({}))
}))

const getInitialProps = (): useInputSetsV1Props => ({
  accountId: 'TEST_ACCOUNT',
  orgIdentifier: 'TEST_ORG',
  pipelineIdentifier: 'TEST_PIPELINE',
  projectIdentifier: 'TEST_PROJECT'
})

describe('<useInputSets /> tests', () => {
  beforeEach(() => {
    ;(useGetPipelineInputs as jest.Mock).mockReset()
  })

  test('works without runtime inputs', async () => {
    ;(useGetPipelineInputs as jest.Mock).mockImplementation().mockReturnValue('')
    const { result } = renderHook(useInputSetsV1, { initialProps: getInitialProps() })

    await waitFor(() => expect(result.current.inputSets).toBeUndefined())
  })
})
