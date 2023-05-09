import { Card, OverflowList } from '@blueprintjs/core'
import { Icon, Layout, Popover } from '@harness/uicore'
import { isUndefined } from 'lodash-es'
import React, { useState } from 'react'

interface TrieNode {
  value: string
  valueTillHere: string
  children: TrieNode[]
  childKeys: {
    key: string
    value: string
  }[]
  childExpressions: string[]
}

interface NewExpressionDropdownProps {
  rootTrieNode: TrieNode
  query: string
}

interface getVisibleItemRendererProps {
  dropDownItemClickHandler: (value: string) => void
}

function getTargetElement(
  isOpen: boolean[],
  setIsOpen: React.Dispatch<React.SetStateAction<boolean[]>>,
  valueTillHere: string
): void {
  const newIsOpen = [...isOpen]
  const targetElement = valueTillHere.split('.').length
  newIsOpen[targetElement] = true
  setIsOpen(newIsOpen)
}

function GetVisibleItemRenderer(props: getVisibleItemRendererProps): any {
  const { dropDownItemClickHandler } = props

  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // eslint-disable-next-line react/display-name
  return (item: TrieNode, index: number): JSX.Element => {
    function itemClickHandler(valueTillHere: string): void {
      getTargetElement(isOpen, setIsOpen, valueTillHere)
    }

    // return the visible item JSX from here

    return (
      <Popover key={index}>
        <Layout.Horizontal>
          <div>{item.value}</div>
          {item.childKeys && (
            <Icon
              name={isOpen[item.valueTillHere.split('.').length] ? 'main-chevron-up' : 'main-chevron-down'}
              onClick={() => itemClickHandler(item.valueTillHere)}
            />
          )}
        </Layout.Horizontal>
        <Layout.Vertical>
          {item.children.map(
            (child, ind) =>
              child.children.length !== 0 && (
                <div
                  key={`${ind} ${child.value}`}
                  onClick={() => {
                    dropDownItemClickHandler(child.valueTillHere)
                    getTargetElement(isOpen, setIsOpen, child.valueTillHere)
                  }}
                >
                  {child.value}
                </div>
              )
          )}
        </Layout.Vertical>
      </Popover>
    )
  }
}

const NewExpressionDropdown = (props: NewExpressionDropdownProps): JSX.Element => {
  const { rootTrieNode, query } = props

  const [queryState, setQueryState] = useState<string>(query)

  const [overflowListItems, setOverflowListItems] = useState<TrieNode[]>([])

  React.useEffect(() => {
    // set list items here and get the correct currentTrieNode
    let currentNode: TrieNode | undefined = rootTrieNode
    const listItems: TrieNode[] = [currentNode]
    const queryItems = queryState.split('.')

    queryItems.forEach(word => {
      const wordIndex = currentNode?.children.findIndex(child => child.value === word)

      if (!isUndefined(wordIndex) && wordIndex !== -1) {
        currentNode = currentNode?.children?.[wordIndex]
        listItems.push(currentNode as TrieNode)
      } else {
        currentNode = undefined
      }
    })

    setOverflowListItems(listItems)
  }, [queryState])

  const dropDownItemClickHandler = (value: string): void => {
    setQueryState(value)
  }

  const visibleItemRenderer = GetVisibleItemRenderer({ dropDownItemClickHandler })

  return (
    <Card>
      <OverflowList
        items={overflowListItems}
        collapseFrom={'start'}
        minVisibleItems={10}
        visibleItemRenderer={visibleItemRenderer}
      />
      <Layout.Vertical>
        {overflowListItems[overflowListItems.length - 1]?.childExpressions?.map(expression => (
          <div key={expression}>{expression}</div>
        ))}
      </Layout.Vertical>
    </Card>
  )
}

export default NewExpressionDropdown
