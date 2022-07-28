/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get, map, memoize } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Menu } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import type { ImagePathTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { Failure, useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import css from '../../ArtifactConnector.module.scss'

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
  connectorRef: string
  fieldName: string
  serviceId?: string
  fqnPath?: string
}

export default function ServerlessArtifactoryRepository(
  props: ServerlessArtifactoryRepositoryProps
): React.ReactElement {
  const { isReadonly, expressions, allowableTypes, formik, connectorRef, fieldName, fqnPath, serviceId } = props
  const { getString } = useStrings()
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const {
    data: artifactRepoData,
    loading: artifactRepoLoading,
    refetch: getArtifactRepos,
    error: artifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryType: 'generic',
      serviceId,
      fqnPath
    },
    lazy: true
  })

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
  }, [artifactRepoLoading, artifactRepoError])

  useEffect(() => {
    if (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED && !artifactRepoData) {
      getArtifactRepos()
    }
    if (artifactRepoData) {
      setConnectorRepos(map(artifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [artifactRepoData, connectorRef])

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

  return (
    <div className={css.imagePathContainer}>
      <FormInput.MultiTypeInput
        className={css.tagInputButton}
        name={fieldName}
        label={getString('repository')}
        selectItems={connectorRepos}
        disabled={isReadonly}
        helperText={
          getMultiTypeFromValue(formik.values.repository as string) === MultiTypeInputType.FIXED &&
          getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME &&
          getString('pipeline.artifactRepositoryDependencyRequired')
        }
        useValue
        multiTypeInputProps={{
          expressions,
          allowableTypes,
          selectProps: {
            defaultSelectedItem: formik.values?.repository as SelectOption,
            noResults: <NoRepositoryResults error={artifactRepoError} />,
            items: connectorRepos,
            addClearBtn: !isReadonly,
            itemRenderer: itemRenderer,
            allowCreatingNewItems: true
          },
          onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            if (
              e?.target?.type !== 'text' ||
              (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
            ) {
              return
            }
            getArtifactRepos()
          }
        }}
      />

      {getMultiTypeFromValue(formik.values.repository) === MultiTypeInputType.RUNTIME && (
        <div className={css.configureOptions}>
          <ConfigureOptions
            value={formik.values.repository as string}
            type="String"
            variableName="repository"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue('repository', value)
            }}
            isReadonly={isReadonly}
          />
        </div>
      )}
    </div>
  )
}
