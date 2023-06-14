/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Pagination } from '@harness/uicore'
import { defaultTo, isEqual } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { TemplatesViewProps } from '@templates-library/pages/TemplatesPage/views/TemplatesView/TemplatesView'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { TEMPLATES_PAGE_SIZE } from '../../TemplatesPageUtils'
import css from './TemplatesGridView.module.scss'

export const TemplatesGridView: React.FC<TemplatesViewProps> = (props): JSX.Element => {
  const {
    data,
    selectedTemplate,
    onSelect,
    onPreview,
    onOpenEdit,
    onOpenSettings,
    onDelete,
    onOpenMoveResource,
    gotoPage,
    reloadTemplates,
    useQueryParamsForPagination
  } = props

  const key = React.useMemo(() => uuid(), [data.content])

  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(data.totalElements, 0),
    pageSize: defaultTo(data.size, PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : TEMPLATES_PAGE_SIZE),
    pageCount: defaultTo(data.totalPages, 0),
    pageIndex: defaultTo(data.number, 0),
    ...(!useQueryParamsForPagination && {
      gotoPage,
      onPageSizeChange: undefined
    })
  })

  return (
    <Layout.Vertical className={css.mainContainer}>
      <Container className={css.gridLayout}>
        <Layout.Masonry
          key={key}
          center
          gutter={25}
          items={defaultTo(data.content, [])}
          renderItem={(template: TemplateSummaryResponse) => (
            <TemplateCard
              template={template}
              onSelect={onSelect}
              isSelected={isEqual(template, selectedTemplate)}
              onPreview={onPreview}
              onOpenEdit={onOpenEdit}
              onOpenSettings={onOpenSettings}
              onDelete={onDelete}
              onOpenMoveResource={onOpenMoveResource}
              reloadTemplates={reloadTemplates}
            />
          )}
          keyOf={(item: TemplateSummaryResponse) => getScopeBasedTemplateRef(item)}
        />
      </Container>
      <Pagination {...paginationProps} />
    </Layout.Vertical>
  )
}
