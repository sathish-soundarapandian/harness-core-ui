/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Container, Layout, Text, useToaster } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Color } from '@wings-software/design-system'
import { PageSpinner } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { parse } from '@common/utils/YamlHelperMethods'
import { useStrings } from 'framework/strings'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import {
  getUpdatedYamlForInfrastructurePromise,
  InfrastructureDefinitionConfig,
  ResponseCustomDeploymentRefreshYaml
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { YamlDiffView } from './YamlDiffView'
import css from './ReconcileHandler.module.scss'
export interface ReconcileInfraDialogProps {
  isEdit: boolean
  originalEntityYaml: string
  updateRootEntity: (refreshedYaml: string) => Promise<void>
}

export function ReconcileInfraDialog({ originalEntityYaml, updateRootEntity }: ReconcileInfraDialogProps): JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const onUpdateNode = async (refreshedYaml: string): Promise<void> => {
    setLoading(true)
    try {
      await updateRootEntity(refreshedYaml)
    } catch (error) {
      showError(getRBACErrorMessage(error as RBACError), undefined, 'template.update.error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUpdatedYamlForInfrastructure = useCallback(async (): Promise<ResponseCustomDeploymentRefreshYaml> => {
    const templateJSON = (
      parse(originalEntityYaml || '') as { infrastructureDefinition: InfrastructureDefinitionConfig }
    )?.infrastructureDefinition
    return await getUpdatedYamlForInfrastructurePromise({
      infraIdentifier: templateJSON?.identifier as string,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      body: { yaml: originalEntityYaml }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalEntityYaml])

  return (
    <Container height={'100%'}>
      ¯{loading && <PageSpinner />}
      <Layout.Vertical height={'100%'}>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.reconcileDialog.title')}</Text>
        </Container>
        <Container
          className={css.diffContentContainer}
          background={Color.FORM_BG}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'xxxlarge', left: 'xxxlarge' }}
        >
          <Layout.Horizontal spacing={'huge'} height={'100%'}>
            <Container style={{ flex: 1 }}>
              <YamlDiffView
                originalEntityYaml={originalEntityYaml}
                onUpdate={onUpdateNode}
                getUpdatedYaml={getUpdatedYamlForInfrastructure}
              />
            </Container>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
