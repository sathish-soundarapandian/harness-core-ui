/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { get, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { FormInput, MultiTypeInputType, Container, Layout, Text, Radio, Icon } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { connect } from 'formik'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getReference } from '@common/utils/utils'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { CodebaseTypes, GIT_EXTENSION, getCodebaseRepoNameFromConnector } from '@pipeline/utils/CIUtils'
import {
  ConnectorInfoDTO,
  getListOfBranchesByRefConnectorV2Promise,
  ResponseGitBranchesResponseDTO,
  useGetConnector
} from 'services/cd-ng'
import type { PipelineV1InfoConfig } from './RunPipelineFormV1'
import { StepViewType } from '../../../components/AbstractSteps/Step'
import css from '../../../components/PipelineInputSetForm/CICodebaseInputSetForm.module.scss'
import pipelineInputSetCss from '../../../components/PipelineInputSetForm/PipelineInputSetForm.module.scss'

export const RUNTIME_INPUT_VALUE_V1 = '<+input.'

export interface CICodebaseInputSetFormV1Props {
  readonly?: boolean
  formik?: any
  viewType: StepViewType
  viewTypeMetadata?: Record<string, boolean>
  originalPipeline?: PipelineV1InfoConfig
  connectorRef?: string
  repoIdentifier?: string
  path?: string
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

function CICodebaseInputSetFormV1Internal({
  readonly,
  formik,
  viewType,
  viewTypeMetadata,
  originalPipeline,
  connectorRef,
  repoIdentifier,
  path
}: CICodebaseInputSetFormV1Props): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const containerWidth = viewTypeMetadata?.isTemplateDetailDrawer ? '100%' : '50%' // drawer view is much smaller 50% would cut out
  const savedValues = useRef<Record<string, string>>(
    Object.assign({
      branch: '',
      tag: '',
      PR: ''
    })
  )
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const formattedPath = isEmpty(path) ? '' : `${path}.`
  const buildPath = `${formattedPath}repository.reference.value`
  const codeBaseTypePath = `${formattedPath}repository.reference.type`
  const codeBaseInputFieldFormName = `${formattedPath}repository.reference.value`
  const [codeBaseType, setCodeBaseType] = useState<CodebaseTypes | undefined>(get(formik?.values, codeBaseTypePath))

  const [isFetchingBranches, setIsFetchingBranches] = useState<boolean>(false)
  const [isDefaultBranchSet, setIsDefaultBranchSet] = useState<boolean>(false)
  const radioLabels = getBuildTypeLabels(getString)
  const codebaseTypeError = get(formik?.errors, codeBaseTypePath)
  const [codebaseConnector, setCodebaseConnector] = useState<ConnectorInfoDTO>()
  const [connectorId, setConnectorId] = useState<string>('')
  const [connectorReference, setConnectorReference] = useState<string>('')

  const inputLabels = getBuildTypeInputLabels(getString)
  const {
    data: connectorDetails,
    loading: loadingConnectorDetails,
    refetch: getConnectorDetails
  } = useGetConnector({
    identifier: connectorId,
    lazy: true
  })

  useEffect(() => {
    if (viewType === StepViewType.DeploymentForm && !isEmpty(formik?.values) && !get(formik?.values, buildPath)) {
      setCodeBaseType(CodebaseTypes.BRANCH)
    }
  }, [get(formik?.values, buildPath), viewType])

  useEffect(() => {
    const type = get(formik?.values, codeBaseTypePath) as CodebaseTypes
    if (type) {
      setCodeBaseType(type)
    }
    const ctrRef = connectorRef ?? (get(originalPipeline, 'repository.connector') as string)
    setConnectorReference(ctrRef)
    setConnectorId(getIdentifierFromValue(ctrRef))
  }, [formik?.values])

  useEffect(() => {
    // OnEdit Case, persists saved ciCodebase build spec
    if (codeBaseType) {
      savedValues.current = Object.assign(savedValues.current, {
        [codeBaseType]: get(formik?.values, `${formattedPath}repository.reference.value`, '')
      })
      const existingValues = { ...formik?.values }
      const updatedValues = set(existingValues, codeBaseTypePath, codeBaseType)
      formik?.setValues(updatedValues)
    }
  }, [codeBaseType])

  useEffect(() => {
    if (connectorId) {
      const connectorScope = getScopeFromValue(connectorReference)
      getConnectorDetails({
        pathParams: {
          identifier: connectorId
        },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: connectorScope === Scope.ORG || connectorScope === Scope.PROJECT ? orgIdentifier : undefined,
          projectIdentifier: connectorScope === Scope.PROJECT ? projectIdentifier : undefined
        }
      })
    }
  }, [connectorId])

  useEffect(() => {
    if (!loadingConnectorDetails && connectorDetails) {
      setCodebaseConnector(connectorDetails?.data?.connector)
    }
  }, [loadingConnectorDetails, connectorDetails])

  useEffect(() => {
    if (codebaseConnector) {
      const codebaseConnectorConnectionType = get(codebaseConnector, 'spec.type')
      if (codebaseConnectorConnectionType === ConnectionType.Repo) {
        fetchBranchesForRepo(getCodebaseRepoNameFromConnector(codebaseConnector))
      } else if (
        codebaseConnectorConnectionType === ConnectionType.Account &&
        !get(originalPipeline, 'repository.name', '').includes(RUNTIME_INPUT_VALUE_V1)
      ) {
        fetchBranchesForRepo(repoIdentifier ?? get(originalPipeline, 'repository.name', ''))
      }
    }
  }, [codebaseConnector, originalPipeline])

  const handleTypeChange = (newType: CodebaseTypes): void => {
    formik?.setFieldValue(codeBaseTypePath, newType)
  }
  const renderCodeBaseTypeInput = (type: CodebaseTypes): JSX.Element => {
    const shouldDisableBranchTextInput = type === CodebaseTypes.BRANCH && isFetchingBranches
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
          disabled={readonly || shouldDisableBranchTextInput}
          onChange={val => {
            savedValues.current[type] = (val || '') as string
          }}
          className={shouldDisableBranchTextInput ? css.width90 : css.width100}
        />
        {shouldDisableBranchTextInput ? <Icon name="steps-spinner" size={20} padding={{ top: 'xsmall' }} /> : null}
      </Layout.Horizontal>
    )
  }

  const shouldAllowRepoFetch = useMemo((): boolean => {
    return (
      viewType === StepViewType.DeploymentForm &&
      codeBaseType === CodebaseTypes.BRANCH &&
      !get(formik?.values, codeBaseInputFieldFormName) &&
      !isDefaultBranchSet &&
      codebaseConnector !== undefined
    )
  }, [viewType, codeBaseType, get(formik?.values, codeBaseInputFieldFormName), isDefaultBranchSet, codebaseConnector])

  const fetchBranchesForRepo = useCallback(
    async (repoName: string) => {
      if (shouldAllowRepoFetch) {
        // Default branch needs to be set only if not specified by the user already for "branch" type build, only on Run Pipeline form
        if (!get(codebaseConnector, 'spec.apiAccess')) {
          return
        }
        const ctrRef = connectorReference?.includes(RUNTIME_INPUT_VALUE_V1)
          ? codebaseConnector && getReference(getScopeFromDTO(codebaseConnector), codebaseConnector.identifier)
          : connectorReference

        if (repoName) {
          try {
            setIsFetchingBranches(true)
            const result: ResponseGitBranchesResponseDTO = await getListOfBranchesByRefConnectorV2Promise({
              queryParams: {
                connectorRef: ctrRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier,
                repoName: encodeURI(repoName.endsWith(GIT_EXTENSION) ? repoName.replace(/\.[^/.]+$/, '') : repoName),
                size: 1
              }
            })
            if (result) {
              setIsFetchingBranches(false)
              const branchName = result.data?.defaultBranch?.name || ''
              formik?.setValues(
                produce(formik?.values, (draft: any) => {
                  set(set(draft, codeBaseTypePath, codeBaseType), codeBaseInputFieldFormName, branchName)
                })
              )
              savedValues.current.branch = branchName as string

              if (result.data?.defaultBranch?.name) {
                setIsDefaultBranchSet(true)
              }
            }
          } catch (e) {
            setIsFetchingBranches(false)
          }
        }
      }
    },
    [shouldAllowRepoFetch, originalPipeline, codeBaseType]
  )

  const disableBuildRadioBtnSelection = useMemo(() => {
    return readonly || (codeBaseType === CodebaseTypes.BRANCH && isFetchingBranches)
  }, [readonly, codeBaseType, isFetchingBranches])

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
                  disabled={disableBuildRadioBtnSelection}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="branch-radio-option"
                />
                <Radio
                  label={radioLabels['tag']}
                  width={90}
                  margin={{ left: 'huge' }}
                  onClick={() => handleTypeChange(CodebaseTypes.TAG)}
                  checked={codeBaseType === CodebaseTypes.TAG}
                  disabled={disableBuildRadioBtnSelection}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="tag-radio-option"
                />
                <Radio
                  label={radioLabels['PR']}
                  width={110}
                  margin={{ left: 'huge' }}
                  onClick={() => handleTypeChange(CodebaseTypes.PR)}
                  checked={codeBaseType === CodebaseTypes.PR}
                  disabled={disableBuildRadioBtnSelection}
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
