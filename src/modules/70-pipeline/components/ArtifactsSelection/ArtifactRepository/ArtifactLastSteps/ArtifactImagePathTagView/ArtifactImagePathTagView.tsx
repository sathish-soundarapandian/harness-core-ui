/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect } from 'react'
import type { FormikValues } from 'formik'
import { Menu } from '@blueprintjs/core'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { isNil, get, memoize } from 'lodash-es'
import type { GetDataError } from 'restful-react'

import type { Failure, Error, ArtifactoryBuildDetailsDTO, DockerBuildDetailsDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { ENABLED_ARTIFACT_TYPES, tagOptions } from '../../../ArtifactHelper'
import { getArtifactPathToFetchTags, helperTextData, resetFieldValue, resetTag } from '../../../ArtifactUtils'
import type { ArtifactImagePathTagViewProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export function NoTagResults({
  tagError,
  isServerlessDeploymentTypeSelected,
  defaultErrorText
}: {
  tagError: GetDataError<Failure | Error> | null
  isServerlessDeploymentTypeSelected?: boolean
  defaultErrorText?: string
}): JSX.Element {
  const { getString } = useStrings()

  const getErrorText = useCallback(() => {
    if (isServerlessDeploymentTypeSelected) {
      /* istanbul ignore next */
      return getString('pipeline.noArtifactPaths')
    }
    return defaultErrorText || getString('pipelineSteps.deploy.errors.notags')
  }, [isServerlessDeploymentTypeSelected, getString])

  return (
    <Text lineClamp={1} width={384} margin="small">
      {get(tagError, 'data.message', null) || getErrorText()}
    </Text>
  )
}

const onTagInputFocus = (
  e: React.FocusEvent<HTMLInputElement>,
  formik: FormikValues,
  fetchTags: (val: string) => void,
  isArtifactPath = false,
  isServerlessDeploymentTypeSelected = false
): void => {
  if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
    return
  }
  fetchTags(getArtifactPathToFetchTags(formik, isArtifactPath, isServerlessDeploymentTypeSelected))
}

export const selectItemsMapper = (
  tagList: DockerBuildDetailsDTO[] | undefined,
  isServerlessDeploymentTypeSelected = false
): SelectOption[] => {
  if (isServerlessDeploymentTypeSelected) {
    return tagList?.map((tag: ArtifactoryBuildDetailsDTO) => ({
      label: tag.artifactPath,
      value: tag.artifactPath
    })) as SelectOption[]
  }
  return tagList?.map(tag => ({ label: tag.tag, value: tag.tag })) as SelectOption[]
}

function ArtifactImagePathTagView({
  selectedArtifact,
  formik,
  buildDetailsLoading,
  tagList,
  setTagList,
  expressions,
  allowableTypes,
  isReadonly,
  connectorIdValue,
  fetchTags,
  tagError,
  tagDisabled,
  isArtifactPath,
  isImagePath = true,
  isServerlessDeploymentTypeSelected,
  canFetchTags,
  tooltipId
}: ArtifactImagePathTagViewProps): React.ReactElement {
  const tooltipProps = tooltipId
    ? {
        tooltipProps: {
          dataTooltipId: tooltipId
        }
      }
    : {}
  const { getString } = useStrings()
  const getSelectItems = useCallback(selectItemsMapper.bind(null, tagList, isServerlessDeploymentTypeSelected), [
    tagList,
    isServerlessDeploymentTypeSelected
  ])

  const loadingPlaceholderText = isServerlessDeploymentTypeSelected
    ? getString('pipeline.artifactsSelection.loadingArtifactPaths')
    : getString('pipeline.artifactsSelection.loadingTags')

  const tags = buildDetailsLoading
    ? [{ label: loadingPlaceholderText, value: loadingPlaceholderText }]
    : getSelectItems()

  useEffect(() => {
    if (!isNil(formik.values?.tag)) {
      if (getMultiTypeFromValue(formik.values?.tag) !== MultiTypeInputType.FIXED) {
        formik.setFieldValue('tagRegex', formik.values?.tag)
      } else {
        formik.setFieldValue('tagRegex', '')
      }
    }
  }, [formik.values?.tag])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={buildDetailsLoading}
        onClick={handleClick}
      />
    </div>
  ))

  const onChangeImageArtifactPath = (): void => {
    tagList?.length && setTagList([])
    resetTag(formik)
  }

  const resetDigestValue = () => {
    if (
      selectedArtifact === ENABLED_ARTIFACT_TYPES.DockerRegistry ||
      selectedArtifact === ENABLED_ARTIFACT_TYPES.Gcr ||
      selectedArtifact === ENABLED_ARTIFACT_TYPES.Ecr
    ) {
      resetFieldValue(formik, 'digest')
    }
  }
  const resetTagTypeValues = () => {
    resetFieldValue(formik, 'tag')
    resetFieldValue(formik, 'tagRegex')
  }
  return (
    <>
      {isServerlessDeploymentTypeSelected ? null : isArtifactPath ? (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            label={getString('pipeline.artifactPathLabel')}
            name="artifactPath"
            placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
            multiTextInputProps={{ expressions, allowableTypes }}
            onChange={onChangeImageArtifactPath}
          />
          {getMultiTypeFromValue(formik?.values?.artifactPath) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik?.values?.artifactPath}
                type="String"
                variableName="artifactPath"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  /* istanbul ignore next */
                  formik.setFieldValue('artifactPath', value)
                }}
                isReadonly={isReadonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
              />
            </div>
          )}
        </div>
      ) : (
        isImagePath && (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTextInput
              label={getString('pipeline.imagePathLabel')}
              name="imagePath"
              placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
              multiTextInputProps={{ expressions, allowableTypes }}
              onChange={() => {
                onChangeImageArtifactPath()
                resetDigestValue()
              }}
            />
            {getMultiTypeFromValue(formik?.values?.imagePath) === MultiTypeInputType.RUNTIME && (
              <div className={css.configureOptions}>
                <ConfigureOptions
                  value={formik?.values?.imagePath}
                  type="String"
                  variableName="imagePath"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => {
                    /* istanbul ignore next */
                    formik.setFieldValue('imagePath', value)
                  }}
                  isReadonly={isReadonly}
                  allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                />
              </div>
            )}
          </div>
        )
      )}

      <div className={css.tagGroup}>
        <FormInput.RadioGroup
          label={
            isServerlessDeploymentTypeSelected ? getString('pipeline.artifactsSelection.artifactDetails') : undefined
          }
          name="tagType"
          radioGroup={{ inline: true }}
          items={tagOptions}
          className={css.radioGroup}
          onChange={() => {
            resetDigestValue()
            resetTagTypeValues()
          }}
        />
      </div>
      {formik?.values?.tagType === 'value' ? (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={tags}
            disabled={tagDisabled}
            helperText={
              getMultiTypeFromValue(formik?.values?.tag) === MultiTypeInputType.FIXED &&
              getHelpeTextForTags(
                helperTextData(selectedArtifact, formik, connectorIdValue),
                getString,
                isServerlessDeploymentTypeSelected
              )
            }
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                defaultSelectedItem: formik?.values?.tag,
                noResults: (
                  <NoTagResults
                    tagError={tagError}
                    isServerlessDeploymentTypeSelected={isServerlessDeploymentTypeSelected}
                  />
                ),
                items: tags,
                addClearBtn: true,
                itemRenderer: itemRenderer,
                allowCreatingNewItems: true,
                addTooltip: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (!canFetchTags || canFetchTags()) {
                  onTagInputFocus(e, formik, fetchTags, isArtifactPath, isServerlessDeploymentTypeSelected)
                }
              },
              onChange: () => resetDigestValue()
            }}
            label={isServerlessDeploymentTypeSelected ? getString('pipeline.artifactPathLabel') : getString('tagLabel')}
            name="tag"
            className={css.tagInputButton}
            {...tooltipProps}
          />

          {getMultiTypeFromValue(formik?.values?.tag) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <SelectConfigureOptions
                options={tags}
                value={formik?.values?.tag}
                type="String"
                variableName="tag"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  /* istanbul ignore next */
                  formik.setFieldValue('tag', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      ) : null}

      {formik.values?.tagType === 'regex' ? (
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            label={
              isServerlessDeploymentTypeSelected ? getString('pipeline.artifactPathFilterLabel') : getString('tagRegex')
            }
            name="tagRegex"
            placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
            multiTextInputProps={{ expressions, allowableTypes }}
          />
          {getMultiTypeFromValue(formik?.values?.tagRegex) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik?.values?.tagRegex}
                type="String"
                variableName="tagRegex"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('tagRegex', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}

export default ArtifactImagePathTagView
