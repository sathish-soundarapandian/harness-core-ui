/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback } from 'react'
import {
  Layout,
  FormInput,
  ExpressionInput,
  Button,
  ButtonSize,
  ButtonVariation,
  Select,
  Text,
  AllowedTypes,
  SelectOption,
  DataTooltipInterface,
  EXPRESSION_INPUT_PLACEHOLDER
} from '@harness/uicore'
import { useFormikContext } from 'formik'
import { get, set } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import css from '../MultiTypeTagSelector/MultiTypeTagSelector.module.scss'

interface SelectedTagsType {
  key: string
  value: string
}

interface MultiTypeTagSelectorProps {
  allowableTypes: AllowedTypes
  tags: SelectOption[]
  isLoadingTags?: boolean
  name: string
  errorMessage?: string
  className?: string
  tooltipProps?: DataTooltipInterface
  expressions: string[]
  initialTags?: object | string
  label?: string
  formatAsArray?: boolean
  selectedTags: any
  setSelectedTags: any
  lastInitialTags: any
}

const preventEnter = (e: React.KeyboardEvent) => {
  /* istanbul ignore next */
  if (e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
  }
}

export function NoTagResults({
  isLoadingTags,
  availableTags,
  tagError
}: {
  tagError?: string
  isLoadingTags?: boolean
  availableTags?: SelectOption[]
}): JSX.Element {
  const { getString } = useStrings()

  const getNoTagsComponent = useCallback(() => {
    if (isLoadingTags) {
      return getString('loading')
    } else if (!isLoadingTags && availableTags?.length) {
      return getString('common.noAvailableTags')
    }
    return tagError || getString('common.noAvailableTags')
  }, [tagError, getString])

  return (
    <Text lineClamp={1} width={400}>
      {getNoTagsComponent()}
    </Text>
  )
}

const TagSelector = ({
  allowableTypes,
  tags,
  isLoadingTags = false,
  name,
  errorMessage,
  className,
  tooltipProps,
  expressions,
  label,
  selectedTags,
  setSelectedTags,
  formatAsArray
}: MultiTypeTagSelectorProps) => {
  const formik = useFormikContext()
  const { getString } = useStrings()

  const usedTagKeys = useMemo(
    () =>
      selectedTags.reduce((map: any, tag: any) => {
        tag.key && set(map, tag.key, true)
        return map
      }, {}),
    [selectedTags]
  )

  const availableTags = useMemo(
    /* istanbul ignore next */
    () => tags.filter((tag: any) => !get(usedTagKeys, get(tag, 'value', ''), false)),
    [tags, usedTagKeys]
  )
  const isFixedValueSetted = typeof get(formik.values, name) === 'object'
  return (
    <MultiTypeFieldSelector
      className={className}
      name={name}
      label={label || getString('tagLabel')}
      skipRenderValueInExpressionLabel
      allowedTypes={allowableTypes}
      supportListOfExpressions={true}
      formik={formik}
      style={{ flexGrow: 1, marginBottom: 0 }}
      tooltipProps={tooltipProps}
      expressionRender={
        /* istanbul ignore next */ () => (
          <ExpressionInput
            name={name}
            value={isFixedValueSetted ? '' : get(formik.values, name)}
            onChange={express => formik.setFieldValue(name, express)}
            inputProps={{ placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
            items={expressions}
          />
        )
      }
    >
      {selectedTags.map((tag: any, index: number) => (
        <Layout.Horizontal spacing="small" key={index} onKeyDown={preventEnter}>
          <Layout.Vertical spacing="small">
            <Text className={css.textStyles}>{index === 0 ? getString('keyLabel') : null}</Text>
            <Select
              name={formatAsArray ? `${name}[${index}].name` : `tagslabel${index + 1}`}
              value={{ label: tag.key, value: tag.key }}
              items={availableTags}
              inputProps={{
                placeholder: availableTags.length === 0 ? getString('common.noAvailableTags') : ''
              }}
              className={css.tagsSelect}
              allowCreatingNewItems={true}
              noResults={
                <NoTagResults isLoadingTags={isLoadingTags} tagError={errorMessage} availableTags={availableTags} />
              }
              onChange={
                /* istanbul ignore next */ option => {
                  const newSelTags = [...selectedTags]
                  newSelTags[index].key = option.value as string
                  newSelTags[index].value = ''
                  setSelectedTags(newSelTags)
                }
              }
            />
          </Layout.Vertical>
          <Layout.Vertical spacing="small">
            <Text className={css.textStyles}>{index === 0 ? 'Value' : null}</Text>
            <FormInput.Text
              name={formatAsArray ? `${name}[${index}].value` : `${name}.${tag.key}`}
              onChange={
                /* istanbul ignore next */ event => {
                  const newSelTags = [...selectedTags]
                  newSelTags[index].value = get(event.target, 'value', '')
                  setSelectedTags(newSelTags)
                }
              }
            />
          </Layout.Vertical>
          <Layout.Horizontal className={css.removeTagBtn}>
            <Button
              icon="trash"
              iconProps={{ size: 12, margin: { right: 8 } }}
              onClick={() => {
                const newSelTags = [...selectedTags]
                newSelTags.splice(index, 1)
                setSelectedTags(newSelTags)
                formik.setFieldValue(`${name}.${tag.key}`, undefined)
              }}
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      ))}
      <Button
        intent="primary"
        icon="add"
        iconProps={{ size: 12, margin: { right: 8 } }}
        className={css.addBtn}
        onClick={() => {
          const newTagPair: SelectedTagsType = { key: '', value: '' }
          setSelectedTags((selTags: any) => [...selTags, newTagPair])
        }}
        size={ButtonSize.SMALL}
        variation={ButtonVariation.LINK}
      >
        {label || getString('tagLabel')}
      </Button>
    </MultiTypeFieldSelector>
  )
}

export default TagSelector
