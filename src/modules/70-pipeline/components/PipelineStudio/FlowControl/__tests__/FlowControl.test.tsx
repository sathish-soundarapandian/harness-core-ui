import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { RightDrawer } from '../../RightDrawer/RightDrawer'
import pipelineContextMock from '../../RightDrawer/__tests__/stateMock'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

describe('FlowControl tests', () => {
  test('should render fine', async () => {
    pipelineContextMock.stepsFactory.getStepData = () => undefined
    pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.FlowControl
    pipelineContextMock.state.pipelineView?.drawerData?.data &&
      (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
        isRollback: false,
        isParallelNodeClicked: false
      } as any)

    const { findByText, container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    expect(container).toMatchSnapshot()
    const flowControlHeader = await findByText('pipeline.barriers.syncBarriers')
    expect(flowControlHeader).toBeInTheDocument()
  })
})
