/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, map, memoize } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Menu } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import { AllowedTypes, getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  Failure,
  ServiceSpec,
  useGetRepositoriesDetailsForArtifactory,
  useGetRepositoriesDetailsV2ForArtifactory
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ImagePathTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useMutateAsGet } from '@common/hooks'
import { usePrevious } from '@common/hooks/usePrevious'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import css from '../../ArtifactConnector.module.scss'
import repositoryFieldCss from './ServerlessArtifactoryRepository.module.scss'

function NoRepositoryResults({ error }: { error: GetDataError<Failure | Error> | null }): JSX.Element {
  const { getString } = useStrings()

  return (
    <span className={css.padSmall}>
      <Text lineClamp={1}>
        {get(error, 'data.message', null) || getString('pipeline.artifactsSelection.errors.noRepositories')}
      </Text>
    </span>
  )
}

export interface ServerlessArtifactoryRepositoryProps {
  expressions: string[]
  isReadonly?: boolean
  allowableTypes: AllowedTypes
  formik: FormikProps<ImagePathTypes>
  connectorRef?: string
  fieldName: string
  serviceId?: string
  fqnPath?: string
  template?: ServiceSpec
  fieldPath?: string
  repoFormat?: string
  stepViewType?: StepViewType
  onChange?: any
  useRepositoriesV2?: boolean
  pipelineRuntimeYaml?: string
  pipelineIdentifier?: string
}

export default function ServerlessArtifactoryRepository(
  props: ServerlessArtifactoryRepositoryProps
): React.ReactElement {
  const {
    isReadonly,
    expressions,
    allowableTypes,
    formik,
    connectorRef,
    fieldName,
    fqnPath,
    serviceId,
    template,
    fieldPath,
    repoFormat,
    stepViewType,
    useRepositoriesV2 = false,
    pipelineRuntimeYaml,
    pipelineIdentifier
  } = props

  const { getString } = useStrings()
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const {
    data: artifactRepoDataV1,
    loading: artifactRepoLoadingV1,
    refetch: getArtifactReposV1,
    error: artifactRepoErrorV1
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryType: repoFormat,
      serviceId,
      fqnPath
    },
    lazy: true
  })

  const {
    data: artifactRepoDataV2,
    loading: artifactRepoLoadingV2,
    refetch: getArtifactReposV2,
    error: artifactRepoErrorV2
  } = useMutateAsGet(useGetRepositoriesDetailsV2ForArtifactory, {
    queryParams: {
      connectorRef: connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryType: repoFormat,
      serviceId,
      fqnPath,
      pipelineIdentifier
    },
    body: pipelineRuntimeYaml,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true
  })

  const {
    data: artifactRepoData,
    loading: artifactRepoLoading,
    refetch: getArtifactRepos,
    error: artifactRepoError
  } = useRepositoriesV2
    ? {
        data: artifactRepoDataV2,
        loading: artifactRepoLoadingV2,
        refetch: getArtifactReposV2,
        error: artifactRepoErrorV2
      }
    : {
        data: artifactRepoDataV1,
        loading: artifactRepoLoadingV1,
        refetch: getArtifactReposV1,
        error: artifactRepoErrorV1
      }

  useEffect(() => {
    if (artifactRepoLoading) {
      setConnectorRepos([{ label: 'Loading Repos...', value: 'Loading Repos...' }])
    }
    if ((artifactRepoError?.data as Failure)?.status === 'ERROR') {
      const errorMessage = (artifactRepoError?.data as Failure)?.message as string
      setConnectorRepos([{ label: errorMessage, value: errorMessage }])
    } else if ((artifactRepoError?.data as Failure)?.status === 'FAILURE') {
      const erroObj = (artifactRepoError?.data as Failure)?.errors?.[0]
      const errorMessage =
        erroObj?.fieldId && erroObj?.error ? `${erroObj?.fieldId} ${erroObj?.error}` : getString('somethingWentWrong')
      setConnectorRepos([{ label: errorMessage, value: errorMessage }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifactRepoLoading, artifactRepoError])

  useEffect(() => {
    if (artifactRepoData) {
      setConnectorRepos(map(artifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [artifactRepoData, connectorRef])

  const previousRepoFormat = usePrevious(repoFormat)

  useEffect(() => {
    if (previousRepoFormat && repoFormat && repoFormat !== previousRepoFormat) {
      setConnectorRepos([])
    }
  }, [repoFormat, previousRepoFormat])

  const hasRepositoryData = () => {
    if (
      (artifactRepoError?.data as Failure)?.status === 'ERROR' ||
      (artifactRepoError?.data as Failure)?.status === 'FAILURE'
    ) {
      return false
    }
    if (connectorRepos.length > 0) {
      return true
    }
    return false
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={artifactRepoLoading || (artifactRepoError?.data as Failure)?.status === 'ERROR'}
        onClick={handleClick}
      />
    </div>
  ))

  const repositoryFormValue = get(formik?.values, fieldName)
  const [repositoryValue, setRepositoryValue] = React.useState(repositoryFormValue)
  const [inputKeyCount, setInputKeyCount] = React.useState(0)

  useEffect(() => {
    if (repositoryValue !== repositoryFormValue) {
      setRepositoryValue(repositoryFormValue)
      setInputKeyCount(prevCount => prevCount + 1)
    }
  }, [repositoryFormValue])

  const getFieldHelperText = () => {
    if (
      getMultiTypeFromValue(repositoryValue) === MultiTypeInputType.FIXED &&
      (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME || connectorRef?.length === 0)
    ) {
      return getString('pipeline.artifactRepositoryDependencyRequired')
    }
  }

  return (
    <SelectInputSetView
      className={
        getMultiTypeFromValue(repositoryValue) === MultiTypeInputType.RUNTIME
          ? repositoryFieldCss.repositoryFieldContainer
          : css.imagePathContainer
      }
      enableConfigureOptions={false}
      key={inputKeyCount}
      name={fieldName}
      label={getString('repository')}
      fieldPath={defaultTo(fieldPath, '')} // Only used for Runtime view
      selectItems={connectorRepos}
      template={defaultTo(template, {})} // Only used for Runtime view
      disabled={isReadonly}
      helperText={getFieldHelperText()}
      useValue={true}
      multiTypeInputProps={{
        expressions,
        allowableTypes,
        selectProps: {
          defaultSelectedItem: repositoryValue as SelectOption,
          noResults: <NoRepositoryResults error={artifactRepoError} />,
          items: connectorRepos,
          addClearBtn: !isReadonly,
          itemRenderer: itemRenderer,
          allowCreatingNewItems: true
        },
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          if (
            e?.target?.type !== 'text' ||
            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
            hasRepositoryData()
          ) {
            return
          }
          getArtifactRepos()
        },
        onChange: val => {
          if (props?.onChange) {
            props.onChange(val)
          }
        }
      }}
      configureOptionsProps={{
        isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
      }}
    />
  )
}
