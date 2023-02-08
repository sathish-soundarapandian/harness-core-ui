/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import { get, isEmpty, set } from 'lodash-es'
import { FormInput, MultiTypeInputType, Container, Layout, Text, Radio, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { connect } from 'formik'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { CodebaseTypes } from '@pipeline/utils/CIUtils'
import { StepViewType } from '../../../components/AbstractSteps/Step'
import css from '../../../components/PipelineInputSetForm/CICodebaseInputSetForm.module.scss'
import pipelineInputSetCss from '../../../components/PipelineInputSetForm/PipelineInputSetForm.module.scss'

export interface CICodebaseInputSetFormV1Props {
  path: string
  readonly?: boolean
  formik?: any
  viewType: StepViewType
  viewTypeMetadata?: Record<string, boolean>
}

export enum ConnectionType {
  Repo = 'Repo',
  Account = 'Account',
  Region = 'Region', // Used for AWS CodeCommit
  Project = 'Project' // Project level Azure Repo connector is the same as an Account level GitHub/GitLab connector
}

export const buildTypeInputNames: Record<string, string> = {
  branch: 'branch',
  tag: 'tag',
  PR: 'number'
}

export const getBuildTypeLabels = (getString: UseStringsReturn['getString']) => ({
  branch: getString('gitBranch'),
  tag: getString('gitTag'),
  PR: getString('pipeline.gitPullRequest')
})

export const getBuildTypeInputLabels = (getString: UseStringsReturn['getString']) => ({
  branch: getString('common.branchName'),
  tag: getString('common.tagName'),
  PR: getString('pipeline.ciCodebase.pullRequestNumber')
})

export const codeBaseInputFieldFormName = `repository.reference.value`

function CICodebaseInputSetFormV1Internal({
  path,
  readonly,
  formik,
  viewType,
  viewTypeMetadata
}: CICodebaseInputSetFormV1Props): JSX.Element {
  const containerWidth = viewTypeMetadata?.isTemplateDetailDrawer ? '100%' : '50%' // drawer view is much smaller 50% would cut out
  const prefix = isEmpty(path) ? '' : `${path}.`
  const buildTypeValue = get(formik?.values, `${prefix}properties.ci.codebase.build.type`)
  const previousBuildTypeSpecValue = get(formik?.values, `${prefix}properties.ci.codebase.build.spec.${buildTypeValue}`)
  const savedValues = useRef<Record<string, string>>(
    Object.assign(
      {
        branch: '',
        tag: '',
        PR: ''
      },
      { [buildTypeValue]: previousBuildTypeSpecValue || '' }
    )
  )
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const buildPath = `repository.reference.value`
  const codeBaseTypePath = `repository.reference.type`
  const [codeBaseType, setCodeBaseType] = useState<CodebaseTypes | undefined>(get(formik?.values, codeBaseTypePath))

  const radioLabels = getBuildTypeLabels(getString)
  const codebaseTypeError = get(formik?.errors, codeBaseTypePath)

  const inputLabels = getBuildTypeInputLabels(getString)

  useEffect(() => {
    if (get(formik?.values, buildPath) === RUNTIME_INPUT_VALUE) {
      setCodeBaseType(undefined)
    } else if (
      viewType === StepViewType.DeploymentForm &&
      !isEmpty(formik?.values) &&
      !get(formik?.values, buildPath)
    ) {
      setCodeBaseType(CodebaseTypes.BRANCH)
    }
  }, [get(formik?.values, buildPath), viewType])

  useEffect(() => {
    const type = get(formik?.values, codeBaseTypePath) as CodebaseTypes
    if (type) {
      setCodeBaseType(type)
    }
  }, [formik?.values])

  // useEffect(() => {
  //   if (
  //     (viewType === StepViewType.InputSet && formik?.values?.pipeline?.identifier) ||
  //     (viewType === StepViewType.DeploymentForm && formik?.values?.identifier)
  //   ) {
  //     const newInitialValues = { ...formik.values }
  //     formik?.setValues(newInitialValues)
  //   }
  // }, [formik?.values?.pipeline?.identifier, formik?.values?.identifier])

  useEffect(() => {
    // OnEdit Case, persists saved ciCodebase build spec
    if (codeBaseType) {
      savedValues.current = Object.assign(savedValues.current, {
        [codeBaseType]: get(formik?.values, `repository.reference.value`, '')
      })
      const existingValues = { ...formik?.values }
      const updatedValues = set(existingValues, codeBaseTypePath, codeBaseType)
      formik?.setValues(updatedValues)
    }
  }, [codeBaseType])

  const handleTypeChange = (newType: CodebaseTypes): void => {
    formik?.setFieldValue(`repository.reference.type`, '')
    formik?.setFieldValue(codeBaseTypePath, newType)
  }
  const renderCodeBaseTypeInput = (type: CodebaseTypes): JSX.Element => {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} spacing="medium">
        <FormInput.MultiTextInput
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
          name={codeBaseInputFieldFormName}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          placeholder=""
          disabled={readonly}
          onChange={val => {
            savedValues.current[type] = (val || '') as string
          }}
          className={css.width100}
        />
      </Layout.Horizontal>
    )
  }

  return (
    <>
      <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
        <Text
          data-name="ci-codebase-title"
          color={Color.BLACK_100}
          font={{ weight: 'semi-bold' }}
          tooltipProps={{
            dataTooltipId: 'ciCodebase'
          }}
        >
          {getString('ciCodebase')}
        </Text>
      </Layout.Horizontal>
      <div className={pipelineInputSetCss.topAccordion}>
        <div className={pipelineInputSetCss.accordionSummary}>
          <div className={pipelineInputSetCss.nestedAccordions}>
            <Layout.Vertical spacing="small">
              <Text
                font={{ variation: FontVariation.FORM_LABEL }}
                tooltipProps={{ dataTooltipId: 'ciCodebaseBuildType' }}
              >
                {getString('filters.executions.buildType')}
              </Text>
              <Layout.Horizontal
                flex={{ justifyContent: 'start' }}
                padding={{ top: 'small', left: 'xsmall', bottom: 'xsmall' }}
                margin={{ left: 'large' }}
              >
                <Radio
                  label={radioLabels['branch']}
                  width={110}
                  onClick={() => handleTypeChange(CodebaseTypes.BRANCH)}
                  checked={codeBaseType === CodebaseTypes.BRANCH}
                  disabled={readonly}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="branch-radio-option"
                />
                <Radio
                  label={radioLabels['tag']}
                  width={90}
                  margin={{ left: 'huge' }}
                  onClick={() => handleTypeChange(CodebaseTypes.TAG)}
                  checked={codeBaseType === CodebaseTypes.TAG}
                  disabled={readonly}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="tag-radio-option"
                />
                <Radio
                  label={radioLabels['PR']}
                  width={110}
                  margin={{ left: 'huge' }}
                  onClick={() => handleTypeChange(CodebaseTypes.PR)}
                  checked={codeBaseType === CodebaseTypes.PR}
                  disabled={readonly}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="pr-radio-option"
                />
              </Layout.Horizontal>
              {codebaseTypeError && formik.submitCount > 0 && <Text color={Color.RED_600}>{codebaseTypeError}</Text>}
              <Container width={containerWidth}>
                {codeBaseType === CodebaseTypes.BRANCH && renderCodeBaseTypeInput(CodebaseTypes.BRANCH)}
                {codeBaseType === CodebaseTypes.TAG && renderCodeBaseTypeInput(CodebaseTypes.TAG)}
                {codeBaseType === CodebaseTypes.PR && renderCodeBaseTypeInput(CodebaseTypes.PR)}
              </Container>
            </Layout.Vertical>
          </div>
        </div>
      </div>
    </>
  )
}

export const CICodebaseInputSetFormV1 = connect(CICodebaseInputSetFormV1Internal)
