import { Card, OverflowList } from '@blueprintjs/core'
import { Icon, Layout, Popover } from '@harness/uicore'
import { isEmpty, isUndefined } from 'lodash-es'
import React, { useState } from 'react'

interface TrieNode {
  value: string
  children: TrieNode[]
  childKeys: string[]
  childExpressions: string[]
}

interface NewExpressionDropdownProps {
  rootTrieNode: TrieNode
  query: string
}

interface getVisibleItemRendererProps {
  dropDownItemClickHandler: (value: string) => void
}

function GetVisibleItemRenderer(props: getVisibleItemRendererProps): any {
  const { dropDownItemClickHandler } = props

  const [isOpen, setIsOpen] = useState(false)
  // eslint-disable-next-line react/display-name
  return (item: TrieNode, index: number): JSX.Element => {
    function itemClickHandler(): void {
      setIsOpen(!isOpen)
    }

    // return the visible item JSX from here

    return (
      <Popover key={index}>
        <Layout.Horizontal>
          <div>{item.value}</div>
          {item.childKeys && (
            <Icon name={isOpen ? 'main-chevron-up' : 'main-chevron-down'} onClick={itemClickHandler} />
          )}
        </Layout.Horizontal>
        <Layout.Vertical>
          {item.childKeys.map((dropDownString, ind) => (
            <div
              key={`${ind} ${dropDownString}`}
              onClick={() => {
                dropDownItemClickHandler(dropDownString)
                setIsOpen(false)
              }}
            >
              {dropDownString}
            </div>
          ))}
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
    if (isEmpty(queryState)) {
      setQueryState(value)
    } else {
      setQueryState(`${queryState}.${value}`)
    }
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
