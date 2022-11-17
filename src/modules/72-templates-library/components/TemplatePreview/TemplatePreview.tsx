/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout } from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import css from './TemplatePreview.module.scss'

interface PreviewInterface {
  previewValues?: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse
  className?: string
}

export const TemplatePreview = (props: PreviewInterface): JSX.Element => {
  const { previewValues, className = '' } = props
  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'center' }}
      className={cx(css.preview, className)}
      padding={{ top: 'huge', bottom: 'huge' }}
    >
      {previewValues && <TemplateCard template={previewValues} />}
    </Layout.Horizontal>
  )
}
