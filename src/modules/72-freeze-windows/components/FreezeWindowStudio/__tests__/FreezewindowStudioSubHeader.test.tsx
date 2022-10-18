import React from 'react'
import { useParams } from 'react-router-dom'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import { FreezeWindowStudioSubHeader } from '../FreezeWindowStudioSubHeader'
import { defaultContext } from './helper'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('Freeze Window Studio Sub Header', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useParams.mockImplementation(() => {
      return { projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }
    })
  })
  test('it should render CreateNewFreezeWindow, when windowIdentifier is "-1"', () => {
    const onViewChange = jest.fn()
    const updateFreeze = jest.fn()
    const { container } = render(
      <TestWrapper>
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            updateFreeze
          }}
        >
          <FreezeWindowStudioSubHeader onViewChange={onViewChange} />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )
    // check toggle, visual/yaml and right view is rendered in the sub header
    expect(document.getElementsByClassName('Toggle--input')[0]).toBeInTheDocument()
    expect(document.getElementsByClassName('visualYamlToggle')[0]).toBeInTheDocument()
    expect(document.getElementsByClassName('headerSaveBtnWrapper')[0]).toBeInTheDocument()

    const portal = document.getElementsByClassName('bp3-dialog')[0]
    expect(portal).toMatchSnapshot('CreateNewFreezeWindow Modal Dialog')
    expect(container).toMatchSnapshot('Freeze Window Sub Header')
  })
})
