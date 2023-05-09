import { Boundary, Card, Menu, OverflowList } from '@blueprintjs/core'
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

function GetOverflowRenderer(props: getVisibleItemRendererProps): any {
  const { dropDownItemClickHandler } = props

  const [isOpen, setIsOpen] = useState<boolean[]>([])

  // eslint-disable-next-line react/display-name
  return (items: TrieNode[]): JSX.Element => {
    function itemClickHandler(valueTillHere: string): void {
      getTargetElement(isOpen, setIsOpen, valueTillHere)
    }

    return (
      <Layout.Horizontal>
        <div style={{ paddingLeft: '5px', fontWeight: 900 }}>{items[0].value}</div>
        <Icon
          name={isOpen[items[0].valueTillHere.split('.').length] ? 'main-chevron-right' : 'main-chevron-down'}
          style={{ paddingLeft: '5px', paddingRight: '10px' }}
          onClick={() => itemClickHandler(items[0].valueTillHere)}
        />
        {items.length > 1 ? (
          <Popover>
            <div>...</div>
            <Menu>
              {items.map((item, index) => {
                if (index !== 0) {
                  return (
                    <Menu.Item
                      key={index}
                      text={item.value}
                      onClick={() => dropDownItemClickHandler(item.valueTillHere)}
                    />
                  )
                }
              })}
            </Menu>
          </Popover>
        ) : null}
      </Layout.Horizontal>
    )
  }
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

    const shallShowNesting = item.children.some(child => child.children.length !== 0)

    return (
      <Popover key={index}>
        <Layout.Horizontal>
          <div style={{ paddingLeft: '5px', fontWeight: 900 }}>{item.value}</div>
          {shallShowNesting && (
            <Icon
              name={isOpen[item.valueTillHere.split('.').length] ? 'main-chevron-right' : 'main-chevron-down'}
              style={{ paddingLeft: '5px' }}
              onClick={() => itemClickHandler(item.valueTillHere)}
            />
          )}
        </Layout.Horizontal>
        <Menu>
          {item.children.map(
            (child, ind) =>
              child.children.length !== 0 && (
                <Menu.Item
                  key={`${ind} ${child.value}`}
                  onClick={() => {
                    dropDownItemClickHandler(child.valueTillHere)
                    getTargetElement(isOpen, setIsOpen, child.valueTillHere)
                  }}
                  text={child.value}
                />
              )
          )}
        </Menu>
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

  const overflowListRenderer = GetOverflowRenderer({ dropDownItemClickHandler })

  return (
    <Card style={{ width: '30%' }}>
      <OverflowList
        items={overflowListItems}
        collapseFrom={Boundary.START}
        visibleItemRenderer={visibleItemRenderer}
        overflowRenderer={overflowListRenderer}
      />
      <Menu>
        {overflowListItems[overflowListItems.length - 1]?.childExpressions?.map(expression => (
          <Menu.Item key={expression} text={expression} />
        ))}
      </Menu>
    </Card>
  )
}

export default NewExpressionDropdown
