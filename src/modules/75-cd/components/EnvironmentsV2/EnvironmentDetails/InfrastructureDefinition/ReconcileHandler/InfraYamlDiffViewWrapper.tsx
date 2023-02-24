/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useIsMounted } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { ResponseCustomDeploymentRefreshYaml } from 'services/cd-ng'
import { YamlDiffView } from '@common/components/YamlDiffView/YamlDiffView'

export interface InfraYamlDiffViewWrapperProps {
  originalEntityYaml: string
  onUpdate: (refreshedYaml: string) => Promise<void>
  getUpdatedYaml: () => Promise<ResponseCustomDeploymentRefreshYaml>
}

export function InfraYamlDiffViewWrapper({
  originalEntityYaml,
  getUpdatedYaml,
  onUpdate
}: InfraYamlDiffViewWrapperProps): JSX.Element {
  const { getString } = useStrings()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<any>()
  const [originalYaml, setOriginalYaml] = React.useState<string>('')
  const [refreshedYaml, setRefreshedYaml] = React.useState<string>('')
  const isMounted = useIsMounted()

  const onNodeUpdate = async (): Promise<void> => {
    onUpdate(refreshedYaml).then(_ => {
      if (isMounted) {
        setOriginalYaml(refreshedYaml)
      }
    })
  }

  const getYamlDiffFromYaml = async (): Promise<void> => {
    try {
      const response = await getUpdatedYaml()

      if (response && response.status === 'SUCCESS') {
        setOriginalYaml(yamlStringify(yamlParse(originalEntityYaml)))
        setRefreshedYaml(yamlStringify(yamlParse(defaultTo(response.data?.refreshedYaml, ''))))
      } else {
        throw response
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async (): Promise<void> => {
    setLoading(true)
    setError(undefined)
    await getYamlDiffFromYaml()
  }

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <YamlDiffView
      originalYaml={originalYaml}
      refreshedYaml={refreshedYaml}
      error={error}
      refetchYamlDiff={refetch}
      loading={loading}
      templateErrorUtils={{
        isTemplateResolved: false,
        buttonLabel: getString('update'),
        onNodeUpdate,
        isYamlDiffForTemplate: false
      }}
    />
  )
}
