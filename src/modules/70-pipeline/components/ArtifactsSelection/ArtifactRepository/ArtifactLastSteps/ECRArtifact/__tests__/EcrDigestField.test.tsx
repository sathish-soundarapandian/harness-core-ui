import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { EcrArtifactDigestField } from '../EcrDigestField'

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetLastSuccessfulBuildForEcr: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn(), error: null, loading: false }
  }),
  canFetchDigest: jest.fn().mockImplementation(() => {
    return true
  })
}))

describe('ECR Digest Wrapper Component', () => {
  test('Rendering and clicking of digest component', () => {
    const initialValues = {
      values: {
        identifier: 'abc1',
        tag: 'v1',
        imagePath: 'repo1',
        region: 'alpha'
      }
    }

    const { container } = render(
      <TestWrapper>
        <EcrArtifactDigestField
          formik={initialValues}
          isVersionDetailsLoading={false}
          expressions={[]}
          connectorRefValue={'abcd'}
          allowableTypes={allowableTypes}
          isReadonly={false}
        />
      </TestWrapper>
    )

    const digestFieldInput = container.querySelector('input[name="digest"]')
    expect(digestFieldInput!).toBeInTheDocument()
    userEvent.click(digestFieldInput!)
  })
})
