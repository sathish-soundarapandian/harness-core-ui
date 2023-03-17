/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useIsMounted } from '@harness/uicore'
import { defaultTo, isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  ErrorNodeSummary,
  getRefreshedYamlPromise,
  getYamlDiffPromise as getYamlDiffPromiseForTemplate,
  TemplateResponse
} from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromDTO
} from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { YamlDiffView } from '@common/components/YamlDiffView/YamlDiffView'

export interface TemplateYamlDiffViewWrapperProps {
  errorNodeSummary?: ErrorNodeSummary
  rootErrorNodeSummary: ErrorNodeSummary
  originalEntityYaml: string
  resolvedTemplateResponses?: TemplateResponse[]
  onUpdate: (refreshedYaml: string) => Promise<void>
  setYamlDiffLoading: (yamlLoading: boolean) => void
}

export function TemplateYamlDiffViewWrapper({
  errorNodeSummary,
  rootErrorNodeSummary,
  originalEntityYaml,
  resolvedTemplateResponses = [],
  onUpdate,
  setYamlDiffLoading
}: TemplateYamlDiffViewWrapperProps): React.ReactElement {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [error, setError] = React.useState<any>()
  const [originalYaml, setOriginalYaml] = React.useState<string>('')
  const [refreshedYaml, setRefreshedYaml] = React.useState<string>('')
  const isMounted = useIsMounted()

  const isTemplateResolved = React.useMemo(
    () => !!resolvedTemplateResponses.find(item => isEqual(item, errorNodeSummary?.templateResponse)),
    [resolvedTemplateResponses, errorNodeSummary?.templateResponse]
  )

  React.useEffect(() => {
    if (isMounted && isTemplateResolved) {
      setOriginalYaml(refreshedYaml)
    }
  }, [isTemplateResolved])

  const onNodeUpdate = async () => {
    await onUpdate(refreshedYaml)
  }

  const getYamlDiffFromYaml = async () => {
    try {
      const templateResponse = errorNodeSummary?.templateResponse
      const response = await getRefreshedYamlPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          ...getGitQueryParamsWithParentScope({
            storeMetadata: {
              branch: templateResponse?.gitDetails?.branch,
              connectorRef: templateResponse?.connectorRef,
              repoName: templateResponse?.gitDetails?.repoName,
              filePath: templateResponse?.gitDetails?.filePath,
              storeType: templateResponse?.storeType
            },
            params
          })
        },
        body: { yaml: originalEntityYaml }
      })
      if (response && response.status === 'SUCCESS') {
        setOriginalYaml(yamlStringify(yamlParse(originalEntityYaml)))
        setRefreshedYaml(yamlStringify(yamlParse(defaultTo(response.data?.refreshedYaml, ''))))
      } else {
        throw response
      }
    } catch (err) {
      setError(err)
    } finally {
      setYamlDiffLoading(false)
    }
  }

  const getYamlDiffForTemplate = async () => {
    try {
      const templateResponse = errorNodeSummary?.templateResponse
      const templateRef = defaultTo(templateResponse?.identifier, '')
      const scope = getScopeFromDTO(templateResponse || {})
      const response = await getYamlDiffPromiseForTemplate({
        queryParams: {
          ...getScopeBasedProjectPathParams(params, scope),
          templateIdentifier: getIdentifierFromValue(templateRef),
          versionLabel: defaultTo(templateResponse?.versionLabel, ''),
          ...getGitQueryParamsWithParentScope({
            storeMetadata: {
              branch: templateResponse?.gitDetails?.branch,
              connectorRef: templateResponse?.connectorRef,
              repoName: templateResponse?.gitDetails?.repoName,
              filePath: templateResponse?.gitDetails?.filePath,
              storeType: templateResponse?.storeType
            },
            params
          })
        }
      })
      if (response && response.status === 'SUCCESS') {
        setOriginalYaml(yamlStringify(yamlParse(defaultTo(response.data?.originalYaml, ''))))
        setRefreshedYaml(yamlStringify(yamlParse(defaultTo(response.data?.refreshedYaml, ''))))
      } else {
        throw response
      }
    } catch (err) {
      setError(err)
    } finally {
      setYamlDiffLoading(false)
    }
  }

  const refetch = async () => {
    setYamlDiffLoading(true)
    setError(undefined)
    if (isEqual(errorNodeSummary, rootErrorNodeSummary)) {
      await getYamlDiffFromYaml()
    } else {
      await getYamlDiffForTemplate()
    }
  }

  const buttonLabel = React.useMemo(() => {
    if (isEqual(errorNodeSummary, rootErrorNodeSummary)) {
      return getString('save')
    } else {
      return getString('update')
    }
  }, [errorNodeSummary, rootErrorNodeSummary])

  React.useEffect(() => {
    if (errorNodeSummary) {
      refetch()
    }
  }, [errorNodeSummary])

  return (
    <YamlDiffView
      originalYaml={originalYaml}
      refreshedYaml={refreshedYaml}
      error={error}
      refetchYamlDiff={refetch}
      templateErrorUtils={{ isTemplateResolved, buttonLabel, onNodeUpdate, isYamlDiffForTemplate: true }}
    />
  )
}
