/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, memoize } from 'lodash-es'
import { Menu } from '@blueprintjs/core'

import { Layout, SelectOption, Text, useToaster } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { DockerBuildDetailsDTO, Failure, Error, ArtifactoryBuildDetailsDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { BuildDetailsDTO, getTagError, isExecutionTimeFieldDisabled } from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface TagsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps, isServerlessDeploymentTypeSelected: boolean) => boolean
  buildDetailsList?: BuildDetailsDTO
  isFieldDisabled: () => boolean
  fetchingTags: boolean
  fetchTags: () => void
  fetchTagsError: GetDataError<Failure | Error> | null
  expressions: string[]
  isServerlessDeploymentTypeSelected?: boolean
  isArtifactPath?: boolean
}
const ArtifactTagRuntimeField = (props: TagsRenderContent): JSX.Element => {
  const {
    formik,
    path,
    readonly,
    expressions,
    allowableTypes,
    artifactPath,
    isTagsSelectionDisabled,
    buildDetailsList,
    isFieldDisabled,
    fetchingTags,
    fetchTags,
    fetchTagsError,
    stageIdentifier,
    isServerlessDeploymentTypeSelected = false,
    stepViewType,
    template,
    viewTypeMetadata
  } = props

  const { getString } = useStrings()
  const loadingPlaceholderText = isServerlessDeploymentTypeSelected
    ? getString('pipeline.artifactsSelection.loadingArtifactPaths')
    : getString('pipeline.artifactsSelection.loadingTags')
  const { showError } = useToaster()

  const [tagsList, setTagsList] = useState<SelectOption[]>([])

  const tagsListOptions = React.useMemo((): SelectOption[] | undefined => {
    if (isServerlessDeploymentTypeSelected) {
      return buildDetailsList?.map((tag: ArtifactoryBuildDetailsDTO) => ({
        label: defaultTo(tag.artifactPath, ''),
        value: defaultTo(tag.artifactPath, '')
      }))
    }
    return buildDetailsList?.map(({ tag }: DockerBuildDetailsDTO) => ({
      label: defaultTo(tag, ''),
      value: defaultTo(tag, '')
    }))
  }, [isServerlessDeploymentTypeSelected, buildDetailsList])

  useEffect(() => {
    if (Array.isArray(buildDetailsList)) {
      if (tagsListOptions) {
        setTagsList(tagsListOptions)
      }
    }
  }, [buildDetailsList, tagsListOptions])

  useEffect(() => {
    if (fetchTagsError) {
      showError(`Stage ${stageIdentifier}: ${getTagError(fetchTagsError)}`, undefined, 'cd.tag.fetch.error')
      setTagsList([])
    }
  }, [fetchTagsError, showError, stageIdentifier])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text className="menuItemColor">{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingTags}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <SelectInputSetView
      fieldPath={`artifacts.${artifactPath}.spec.tag`}
      template={template}
      formik={formik}
      disabled={isFieldDisabled()}
      selectItems={
        fetchingTags
          ? [
              {
                label: loadingPlaceholderText,
                value: loadingPlaceholderText
              }
            ]
          : tagsList
      }
      useValue
      multiTypeInputProps={{
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          if (
            e?.target?.type !== 'text' ||
            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
          ) {
            return
          }

          if (!isTagsSelectionDisabled(props, isServerlessDeploymentTypeSelected)) {
            fetchTags()
          }
        },
        selectProps: {
          items: fetchingTags
            ? [
                {
                  label: loadingPlaceholderText,
                  value: loadingPlaceholderText
                }
              ]
            : tagsList,
          usePortal: true,
          addClearBtn: !(readonly || isTagsSelectionDisabled(props, isServerlessDeploymentTypeSelected)),
          noResults: (
            <Text lineClamp={1}>{getTagError(fetchTagsError) || getString('pipelineSteps.deploy.errors.notags')}</Text>
          ),
          itemRenderer,
          allowCreatingNewItems: true,
          popoverClassName: css.selectPopover,
          loadingItems: fetchingTags
        },
        expressions,
        allowableTypes
      }}
      label={isServerlessDeploymentTypeSelected ? getString('pipeline.artifactPathLabel') : getString('tagLabel')}
      name={
        isServerlessDeploymentTypeSelected
          ? `${path}.artifacts.${artifactPath}.spec.artifactPath`
          : `${path}.artifacts.${artifactPath}.spec.tag`
      }
      configureOptionsProps={{
        isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
      }}
      tooltipProps={{ dataTooltipId: viewTypeMetadata?.isTrigger ? 'triggerArtifactTag' : '' }}
    />
  )
}

export default ArtifactTagRuntimeField
