/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleSortableList from '../ModuleSortableList'
import type { DraggableModuleItemProps } from '../DraggableModuleItem/DraggableModuleItem'

jest.mock('../DraggableModuleItem/DraggableModuleItem', () => {
  // eslint-disable-next-line react/display-name
  return (props: DraggableModuleItemProps) => {
    return (
      <div>
        draggableModuleItem
        <button
          data-testid={`${props.module}-check`}
          onClick={() => {
            props.onCheckboxChange?.(true)
          }}
        ></button>
        <button
          data-testid={`${props.module}-uncheck`}
          onClick={() => {
            props.onCheckboxChange?.(false)
          }}
        ></button>
      </div>
    )
  }
})

jest.mock('react-beautiful-dnd', () => {
  return {
    Droppable: (props: any) => {
      return <div>{props.children({ provided: {} })}</div>
    },
    DragDropContext: (props: any) => {
      return (
        <div>
          {props.children}
          <button
            data-testid="onDrag"
            onClick={() => {
              props.onDragEnd({
                destination: { index: 1 },
                source: { index: 2 }
              })
            }}
          ></button>
          <button
            data-testid="onDragFail"
            onClick={() => {
              props.onDragEnd({
                source: { index: 2 }
              })
            }}
          ></button>
        </div>
      )
    }
  }
})

describe('Module Sortable List', () => {
  test('render without modules', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ModuleSortableList
          activeModule={ModuleName.CD}
          handleUpdate={() => {
            // handle update
          }}
          onSelect={() => {
            // on select
          }}
          orderedModules={[]}
          selectedModules={[]}
        />
      </TestWrapper>
    )
    expect(queryByText('draggableModuleItem')).toBeNull()
  })

  test('render with modules enabled', () => {
    const handleUpdate = jest.fn()
    const onSelect = jest.fn()
    const { queryAllByText } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CDNG_ENABLED: true,
          CING_ENABLED: true,
          CENG_ENABLED: true
        }}
      >
        <ModuleSortableList
          activeModule={ModuleName.CD}
          handleUpdate={handleUpdate}
          onSelect={onSelect}
          orderedModules={[ModuleName.CD, ModuleName.CI, ModuleName.CE]}
          selectedModules={[]}
        />
      </TestWrapper>
    )
    expect(queryAllByText('draggableModuleItem').length).toEqual(3)
  })

  test('on module checked and unchecked', () => {
    const handleUpdate = jest.fn()
    const onSelect = jest.fn()
    const { container } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CDNG_ENABLED: true,
          CING_ENABLED: true,
          CENG_ENABLED: true
        }}
      >
        <ModuleSortableList
          activeModule={ModuleName.CD}
          handleUpdate={handleUpdate}
          onSelect={onSelect}
          orderedModules={[ModuleName.CD, ModuleName.CI, ModuleName.CE]}
          selectedModules={[]}
        />
      </TestWrapper>
    )

    const cdCheckbtn = container.querySelector('[data-testid="CD-check"]')
    fireEvent.click(cdCheckbtn!)
    expect(handleUpdate).toBeCalledWith([ModuleName.CD, ModuleName.CI, ModuleName.CE], [ModuleName.CD])
    const cdCheckuncheckbtn = container.querySelector('[data-testid="CD-uncheck"]')
    fireEvent.click(cdCheckuncheckbtn!)
    expect(handleUpdate).toBeCalledWith([ModuleName.CD, ModuleName.CI, ModuleName.CE], [])
  })

  test('on drag', () => {
    const handleUpdate = jest.fn()
    const onSelect = jest.fn()
    const { container } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CDNG_ENABLED: true,
          CING_ENABLED: true,
          CENG_ENABLED: true
        }}
      >
        <ModuleSortableList
          activeModule={ModuleName.CD}
          handleUpdate={handleUpdate}
          onSelect={onSelect}
          orderedModules={[ModuleName.CD, ModuleName.CI, ModuleName.CE]}
          selectedModules={[]}
        />
      </TestWrapper>
    )

    const onDragBtn = container.querySelector('[data-testid="onDrag"]')
    fireEvent.click(onDragBtn!)
    expect(handleUpdate).toBeCalledWith([ModuleName.CD, ModuleName.CE, ModuleName.CI], [])
  })

  test('on drag when destination is not present', () => {
    const handleUpdate = jest.fn()
    const onSelect = jest.fn()
    const { container } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CDNG_ENABLED: true,
          CING_ENABLED: true,
          CENG_ENABLED: true
        }}
      >
        <ModuleSortableList
          activeModule={ModuleName.CD}
          handleUpdate={handleUpdate}
          onSelect={onSelect}
          orderedModules={[ModuleName.CD, ModuleName.CI, ModuleName.CE]}
          selectedModules={[]}
        />
      </TestWrapper>
    )

    const onDragBtn = container.querySelector('[data-testid="onDragFail"]')
    fireEvent.click(onDragBtn!)
    expect(handleUpdate).not.toBeCalled()
  })
})
