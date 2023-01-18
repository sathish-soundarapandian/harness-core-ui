import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineOutOfSyncErrorStrip,
  PipelineOutOfSyncErrorStripProps
} from '@pipeline/components/TemplateLibraryErrorHandling/PipelineOutOfSyncErrorStrip/PipelineOutOfSyncErrorStrip'

const errorNodeSummaryDummmyResponse = {
  nodeInfo: {
    identifier: 'P2',
    name: 'P2',
    localFqn: ''
  },
  templateInfo: {},
  templateResponse: { accountId: '', identifier: '', name: '' },
  childrenErrorNodes: []
}

const baseProps: PipelineOutOfSyncErrorStripProps = {
  updateRootEntity: jest.fn(),
  onRefreshEntity: jest.fn()
}

describe('<PipelineOutOfSyncErrorStrip /> tests', () => {
  test('should call OutOfSyncErrorStrip with correct props when error', () => {
    const { getByText } = render(
      <TestWrapper>
        <PipelineOutOfSyncErrorStrip
          {...baseProps}
          errorData={{
            data: {
              type: 'TemplateInputsErrorMetadataV2',
              validYaml: false,
              errorNodeSummary: errorNodeSummaryDummmyResponse
            }
          }}
        />
      </TestWrapper>
    )

    expect(getByText('pipeline.outOfSyncErrorStrip.updatedTemplateInfo')).toBeInTheDocument()
    expect(getByText('pipeline.outOfSyncErrorStrip.reconcile')).toBeInTheDocument()
  })

  test('should not call OutOfSyncErrorStrip when no error', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineOutOfSyncErrorStrip {...baseProps} />
      </TestWrapper>
    )

    expect(container).toMatchInlineSnapshot(`<div />`)
  })
})
