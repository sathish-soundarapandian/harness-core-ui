/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, NestedAccordionPanel, AllowedTypes } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { VariableResponseMapValue } from 'services/template-ng'

import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { ArtifactSourceTemplateConfig } from '@pipeline/components/PipelineStudio/PipelineVariables/types'
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface ArtifactSourceTemplateCardProps {
  artifactSourceTemplate: ArtifactSourceTemplateConfig
  originalArtifactSourceTemplate: ArtifactSourceTemplateConfig
  unresolvedArtifactSourceTemplate: ArtifactSourceTemplateConfig
  metadataMap: PipelineVariablesData['metadataMap']
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
}

interface MetaDataInterface {
  [key: string]: VariableResponseMapValue
}

const updateLocalNameInMetaData = (metadataMap: MetaDataInterface): MetaDataInterface => {
  const updatedMetadataMap: MetaDataInterface = {}
  Object.keys(metadataMap).forEach(key => {
    const updatedData = {
      ...metadataMap[key],
      yamlProperties: {
        ...metadataMap[key]?.yamlProperties,
        localName: metadataMap[key]?.yamlProperties?.variableName
      }
    }
    updatedMetadataMap[key] = updatedData
  })
  return updatedMetadataMap
}

export default function ArtifactSourceTemplateCard(props: ArtifactSourceTemplateCardProps): React.ReactElement {
  const { artifactSourceTemplate, originalArtifactSourceTemplate, metadataMap, path } = props
  const updatedMetadataMap = updateLocalNameInMetaData(metadataMap)

  const content = (
    <div className={css.variableCard}>
      <VariablesListTable
        data={artifactSourceTemplate?.spec}
        className={cx(css.variablePaddingL0)}
        originalData={originalArtifactSourceTemplate?.spec}
        metadataMap={updatedMetadataMap}
      />
    </div>
  )

  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      collapseProps={{
        keepChildrenMounted: true
      }}
      key={`${path}.${originalArtifactSourceTemplate?.identifier}`}
      id={`${path}.${originalArtifactSourceTemplate?.identifier}`}
      addDomId
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.H6 }} color={Color.BLACK}>
            {originalArtifactSourceTemplate?.name
              ? `Artifact Source: ${originalArtifactSourceTemplate?.name}`
              : 'Artifact Source'}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.stageSummary}
      details={content}
    />
  )
}
