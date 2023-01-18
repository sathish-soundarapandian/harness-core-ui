import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ReconcileDialog,
  ReconcileDialogProps
} from '@pipeline/components/TemplateLibraryErrorHandling/ReconcileDialog/ReconcileDialog'
import type { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'

const errorNodeSummaryDummmyResponseWithChildren = {
  nodeInfo: {
    identifier: 'P2',
    name: 'P2',
    localFqn: ''
  },
  childrenErrorNodes: [
    {
      nodeInfo: {
        identifier: 'P2',
        name: 'P2',
        localFqn: ''
      },
      childrenErrorNodes: []
    }
  ]
}

const errorNodeSummaryDummmyResponseWithoutChildren = {
  nodeInfo: {
    identifier: 'P2',
    name: 'P2',
    localFqn: ''
  },
  childrenErrorNodes: []
}

jest.mock('services/template-ng', () => ({
  refreshAllPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  getRefreshedYamlPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

const baseProps: ReconcileDialogProps = {
  errorNodeSummary: errorNodeSummaryDummmyResponseWithChildren,
  entity: 'Template' as TemplateErrorEntity,
  isEdit: true,
  originalEntityYaml: '',
  updateRootEntity: jest.fn()
}

describe('<ReconcileDialog /> tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('initial render with children', () => {
    const { container } = render(
      <TestWrapper>
        <ReconcileDialog {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render without children', () => {
    const updatedProps = {
      ...baseProps,
      errorNodeSummary: errorNodeSummaryDummmyResponseWithoutChildren
    }
    const { container } = render(
      <TestWrapper>
        <ReconcileDialog {...updatedProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
