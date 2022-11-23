/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import { Position } from '@blueprintjs/core'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner, TagsPopover } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import {
  PageTemplateSummaryResponse,
  TemplateResponse,
  TemplateSummaryResponse,
  useGetTemplateList
} from 'services/template-ng'

interface TemplateDTO extends TemplateResponse {
  admin?: string
  collaborators?: string
  status?: string
}

//TODO: This interface needs to be removed once identifier type is fixed in backend
interface TemplateSummaryResponseDTO extends Omit<TemplateSummaryResponse, 'identifier'> {
  identifier: string
}

export const RenderColumnTemplate: Renderer<CellProps<TemplateDTO>> = ({ row }) => {
  const rowdata = row.original
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall" data-testid={rowdata.identifier}>
      <Layout.Horizontal spacing="medium">
        <Text
          color={Color.GREY_800}
          tooltipProps={{ position: Position.BOTTOM }}
          tooltip={
            <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
              <Text>{getString('nameLabel', { name: rowdata.name })}</Text>
              <Text>{getString('idLabel', { id: rowdata.identifier })}</Text>
              <Text>{getString('descriptionLabel', { description: rowdata.description })}</Text>
            </Layout.Vertical>
          }
        >
          {rowdata.name}
        </Text>
        {rowdata.tags && Object.keys(rowdata.tags).length ? <TagsPopover tags={rowdata.tags} /> : null}
      </Layout.Horizontal>
      <Text tooltipProps={{ position: Position.BOTTOM }} color={Color.GREY_400}>
        {getString('idLabel', { id: rowdata.identifier })}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderTemplateEntityType: Renderer<CellProps<TemplateDTO>> = ({ row }) => {
  const rowdata = row.original
  return (
    <Layout.Horizontal spacing="medium">
      <Text color={Color.GREY_800}>{rowdata.templateEntityType}</Text>
    </Layout.Horizontal>
  )
}
export const RenderTemplateEntityScope: Renderer<CellProps<TemplateDTO>> = ({ row }) => {
  const rowdata = row.original
  return (
    <Layout.Horizontal spacing="medium">
      <Text color={Color.GREY_800}>{rowdata.templateScope}</Text>
    </Layout.Horizontal>
  )
}

const TemplateResourceModal: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const [templateData, setData] = React.useState<PageTemplateSummaryResponse | undefined>()
  const { getString } = useStrings()

  const {
    loading,
    mutate: reloadTemplates,
    cancel
  } = useGetTemplateList({
    queryParams: {
      templateListType: 'Stable',
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      page,
      size: 10
    }
  })

  const fetchTemplates = React.useCallback(async () => {
    cancel()
    setData(await (await reloadTemplates({ filterType: 'Template' })).data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountIdentifier, projectIdentifier, orgIdentifier, module])

  const templateContentData: TemplateSummaryResponse[] = templateData?.content || []

  if (loading) return <PageSpinner />
  return templateContentData?.length ? (
    <Container>
      <ResourceHandlerTable<TemplateSummaryResponseDTO>
        data={templateContentData as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('common.templates'),
            id: 'name',
            accessor: 'name',
            Cell: RenderColumnTemplate,
            width: '40%',
            disableSortBy: true
          },
          {
            Header: getString('common.entityType'),
            id: 'templateEntityType',
            accessor: 'templateEntityType',
            Cell: RenderTemplateEntityType,
            width: '30%',
            disableSortBy: true
          },
          {
            Header: getString('templatesLibrary.templateScope'),
            id: 'templateScope',
            accessor: 'templateScope',
            Cell: RenderTemplateEntityScope,
            width: '20%',
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: templateData?.totalElements || 0,
          pageSize: templateData?.size || 10,
          pageCount: templateData?.totalPages ?? 1,
          pageIndex: templateData?.number ?? 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default TemplateResourceModal
