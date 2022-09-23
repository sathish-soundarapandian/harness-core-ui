import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import PopoverMenuItem from '../PerspectiveMenuItems'

describe('Test cases for perspective Menu items', () => {
  test('Should render the menu items', () => {
    const { container } = render(
      <TestWrapper>
        <PopoverMenuItem
          disabled={true}
          onClick={jest.fn()}
          icon="edit"
          text="Edit"
          tooltip={
            <RBACTooltip
              permission={PermissionIdentifier.EDIT_CCM_PERSPECTIVE}
              resourceType={ResourceType.CCM_PERSPECTIVE}
            />
          }
        />
      </TestWrapper>
    )

    const menuItem = container.querySelector('[data-testid="menuItem"]')
    expect(menuItem).toBeDefined()

    act(() => {
      fireEvent.click(menuItem!)
    })

    expect(container).toMatchSnapshot()
  })
})
