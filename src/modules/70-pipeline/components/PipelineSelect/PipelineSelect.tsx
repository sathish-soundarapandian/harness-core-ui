/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Select as BPSelect, ItemRenderer, ItemListRenderer, IItemListRendererProps } from '@blueprintjs/select'
import { Button, Menu, Spinner } from '@blueprintjs/core'

import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetPipelineList, PMSPipelineSummaryResponse, PagePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { String } from 'framework/strings'

import css from './PipelineSelect.module.scss'

export interface PipelineSelectProps {
  selectedPipeline?: string
  onPipelineSelect(id: string): void
  defaultSelect?: string
  className?: string
}

const Select = BPSelect.ofType<PMSPipelineSummaryResponse>()

const itemRenderer: ItemRenderer<PMSPipelineSummaryResponse> = (item, props) => (
  <Menu.Item key={item.identifier} text={item.name} active={props.modifiers.active} onClick={props.handleClick} />
)

export default function PipelineSelect(props: PipelineSelectProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const [query, setQuery] = React.useState('')
  const [data, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const {
    loading,
    mutate: reloadPipelines,
    cancel
  } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      searchTerm: query,
      size: 10
    }
  })

  const fetchPipelines = React.useCallback(async () => {
    cancel()
    setData(await (await reloadPipelines({ filterType: 'PipelineSetup' })).data)
  }, [reloadPipelines, cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, projectIdentifier, orgIdentifier, module, query])
  function clearSelection(): void {
    props.onPipelineSelect('')
  }

  const selectedValue = props.selectedPipeline
    ? (data?.content || []).find(item => item.identifier === props.selectedPipeline)
    : null

  const getMenuItem = (itemListProps: IItemListRendererProps<PMSPipelineSummaryResponse>) => {
    if (loading) {
      return <Spinner size={20} />
    }
    if (itemListProps.items.length > 0) {
      return (
        <React.Fragment>
          {selectedValue ? <Menu.Item text="Clear Selection" icon="cross" onClick={clearSelection} /> : null}
          {itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))}
        </React.Fragment>
      )
    }
    return <Menu.Item text="No Results" disabled />
  }

  const itemListRender: ItemListRenderer<PMSPipelineSummaryResponse> = itemListProps => (
    <Menu>{getMenuItem(itemListProps)}</Menu>
  )

  function handleSelect(item: PMSPipelineSummaryResponse): void {
    props.onPipelineSelect(item.identifier || '')
  }

  const getSelectedItem = () => {
    if (selectedValue) {
      return selectedValue.name
    }
    return defaultSelect ? defaultSelect : <String stringID="pipelines" />
  }

  const { defaultSelect, className } = props

  return (
    <Select
      items={data?.content || []}
      itemRenderer={itemRenderer}
      onItemSelect={handleSelect}
      popoverProps={{ minimal: true, wrapperTagName: 'div', targetTagName: 'div' }}
      activeItem={selectedValue}
      resetOnQuery={false}
      query={query}
      onQueryChange={setQuery}
      itemListRenderer={itemListRender}
      className={className}
    >
      <Button className={css.main} rightIcon="chevron-down" data-testid="pipeline-select">
        {getSelectedItem()}
      </Button>
    </Select>
  )
}
