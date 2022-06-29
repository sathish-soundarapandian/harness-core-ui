/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { Icon, Layout, Text } from '@wings-software/uicore'
import React, { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import buildpipelineIllustration from './images/buildpipeline-illustration.svg'
import pipelineIllustration from './images/deploypipeline-illustration.svg'
import flagpipelineIllustration from './images/flagpipeline-illustration.svg'
import css from './PipelinesPage.module.scss'

interface PipelineListEmptyProps {
  hasFilter: boolean
  resetFilter: () => void
  createPipeline: ReactNode
}
function PipelineListEmpty({ hasFilter, resetFilter, createPipeline }: PipelineListEmptyProps): React.ReactElement {
  const { getString } = useStrings()
  const { module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()
  const isCIModule = module === 'ci'
  const isCFModule = module === 'cf'
  const emptyStagePipelineImage = isCIModule
    ? buildpipelineIllustration
    : isCFModule
    ? flagpipelineIllustration
    : pipelineIllustration

  return (
    <div className={css.noPipelineSection}>
      {hasFilter ? (
        <Layout.Vertical spacing="small" flex>
          <Icon size={50} name={isCIModule ? 'ci-main' : 'cd-main'} margin={{ bottom: 'large' }} />
          <Text
            margin={{ top: 'large', bottom: 'small' }}
            font={{ weight: 'bold', size: 'medium' }}
            color={Color.GREY_800}
          >
            {getString('common.filters.noMatchingFilterData')}
          </Text>
          <String stringID="common.filters.clearFilters" className={css.clearFilterText} onClick={resetFilter} />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
          <img src={emptyStagePipelineImage} className={css.image} />
          <Text className={css.noPipelineText} margin={{ top: 'medium', bottom: 'small' }}>
            {getString('pipeline.noPipelineText')}
          </Text>
          <Text className={css.aboutPipeline} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
            {getString('pipeline-list.aboutPipeline')}
          </Text>
          {createPipeline}
        </Layout.Vertical>
      )}
    </div>
  )
}

export default PipelineListEmpty
