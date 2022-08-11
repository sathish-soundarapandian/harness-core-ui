/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { omit, without, defaultTo } from 'lodash-es'
import {
  Layout,
  Container,
  Button,
  ButtonVariation,
  PageHeader,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  useConfirmationDialog,
  useToaster
} from '@wings-software/uicore'

import {
  SecretTextSpecDTO,
  usePutSecretViaYaml,
  ResponseSecretResponseWrapper,
  useGetYamlSchema,
  useGetYamlSnippetMetadata,
  useGetYamlSnippet,
  SecretResponseWrapper
} from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { SnippetFetchResponse, YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import { useCreateWinRmCredModal } from '@secrets/modals/CreateWinRmCredModal/useCreateWinRmCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import ViewSecretDetails from './views/ViewSecretDetails'
import './SecretDetails.module.scss'

interface SecretDetailsProps {
  secretData?: ResponseSecretResponseWrapper
  refetch?: () => void
}

interface YAMLSecretDetailsProps {
  refetch?: () => void
  secretData: SecretResponseWrapper
  edit?: boolean
  setEdit: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

const yamlSanityConfig = {
  removeEmptyString: false
}

const YAMLSecretDetails: React.FC<YAMLSecretDetailsProps> = ({ refetch, secretData, edit, setEdit }) => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier, secretId } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [snippetFetchResponse, setSnippetFetchResponse] = React.useState<SnippetFetchResponse>()
  const [fieldsRemovedFromYaml, setFieldsRemovedFromYaml] = useState(['draft', 'createdAt', 'updatedAt'])

  useEffect(() => {
    if (secretData.secret.type !== 'SecretText') {
      return
    }

    switch ((secretData.secret.spec as SecretTextSpecDTO)?.valueType) {
      case 'Inline':
        setFieldsRemovedFromYaml([...fieldsRemovedFromYaml, 'secret.spec.value'])
        break
      case 'Reference':
        // 'value' field should be persisted in visual->yaml transistion for reference type
        setFieldsRemovedFromYaml(without(fieldsRemovedFromYaml, 'secret.spec.value'))
        break
    }
  }, [secretData])

  const { data: secretSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Secrets',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId
    }
  })

  const { data: snippetData } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Secrets')
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: snippet,
    refetch: refetchSnippet,
    cancel,
    loading: isFetchingSnippet,
    error: errorFetchingSnippet
  } = useGetYamlSnippet({
    identifier: '',
    lazy: true
  })

  const onSnippetCopy = async (identifier: string): Promise<void> => {
    cancel()
    await refetchSnippet({
      pathParams: {
        identifier
      }
    })
  }

  useEffect(() => {
    let snippetStr = ''
    try {
      snippetStr = snippet?.data ? yamlStringify(snippet.data, { indent: 4 }) : ''
    } catch {
      /**/
    }
    setSnippetFetchResponse({
      snippet: snippetStr,
      loading: isFetchingSnippet,
      error: errorFetchingSnippet
    })
  }, [isFetchingSnippet])

  const { mutate: updateSecretYaml } = usePutSecretViaYaml({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    // this is required to make sure backend understands the content type correctly
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const handleSaveYaml = async (): Promise<void> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let jsonData
    try {
      jsonData = parse(defaultTo(yamlData, ''))
    } catch (err) {
      showError(err.message)
    }

    if (yamlData && jsonData) {
      try {
        await updateSecretYaml(yamlData as any)
        showSuccess(getString('secrets.secret.updateSuccess'))
        setEdit(false)
        refetch?.()
      } catch (err) {
        showError(getRBACErrorMessage(err))
      }
    }
  }

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        setEdit(false)
        refetch?.()
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }

  return (
    <Container>
      {edit && (
        <>
          <YamlBuilder
            entityType={'Secrets'}
            fileName={`${secretData.secret.name}.yaml`}
            existingJSON={omit(secretData, fieldsRemovedFromYaml)}
            bind={setYamlHandler}
            height="calc(100vh - 350px)"
            onSnippetCopy={onSnippetCopy}
            snippetFetchResponse={snippetFetchResponse}
            schema={secretSchema?.data}
            isReadOnlyMode={false}
            snippets={snippetData?.data?.yamlSnippets}
            yamlSanityConfig={yamlSanityConfig}
            showSnippetSection={false}
          />
          <Layout.Horizontal spacing="medium">
            <Button
              intent="primary"
              text={getString('save')}
              onClick={handleSaveYaml}
              margin={{ top: 'large' }}
              variation={ButtonVariation.PRIMARY}
            />
            <Button
              text={getString('cancel')}
              margin={{ top: 'large' }}
              onClick={resetEditor}
              variation={ButtonVariation.TERTIARY}
            />
          </Layout.Horizontal>
        </>
      )}
      {!edit && (
        <YamlBuilder
          entityType={'Secrets'}
          existingJSON={omit(secretData, fieldsRemovedFromYaml)}
          fileName={`${secretData.secret.name}.yaml`}
          height="calc(100vh - 350px)"
          isReadOnlyMode={true}
          showSnippetSection={false}
          onEnableEditMode={() => setEdit(true)}
          yamlSanityConfig={yamlSanityConfig}
        />
      )}
    </Container>
  )
}

const SecretDetails: React.FC<SecretDetailsProps> = props => {
  const { getString } = useStrings()
  const [edit, setEdit] = useState<boolean>()
  const [mode, setMode] = useState<SelectedView>(SelectedView.VISUAL)
  const data = props.secretData

  const [secretData, setSecretData] = useState(data?.data)

  const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: props.refetch })
  const { openCreateWinRmCredModal } = useCreateWinRmCredModal({ onSuccess: props.refetch })
  const { openCreateSecretModal } = useCreateUpdateSecretModal({ onSuccess: props.refetch })

  useDocumentTitle([getString('overview'), defaultTo(secretData?.secret.name, ''), getString('common.secrets')])

  useEffect(() => {
    setSecretData(data?.data)
  }, [data?.data])

  if (!secretData) {
    return (
      <Container flex={{ align: 'center-center' }} padding="xxlarge">
        {getString('noData')}
      </Container>
    )
  }

  const handleVisualMode = (): void => {
    if (secretData.secret.type === 'SSHKey') {
      openCreateSSHCredModal(data?.data?.secret)
      return
    }
    if (secretData.secret.type === 'WinRmCredentials') {
      openCreateWinRmCredModal(data?.data?.secret)
      return
    }
    openCreateSecretModal(secretData.secret.type, {
      identifier: secretData.secret?.identifier,
      orgIdentifier: secretData.secret?.orgIdentifier,
      projectIdentifier: secretData.secret?.projectIdentifier
    } as SecretIdentifiers)
  }

  const handleEdit = (): void => {
    if (mode === SelectedView.VISUAL) {
      handleVisualMode()
      return
    }
    setEdit(true)
  }

  return (
    <>
      <PageHeader size="standard" title={getString('overview')} />
      <Container padding={{ top: 'large', left: 'huge', right: 'huge' }}>
        <Container padding={{ bottom: 'large' }}>
          {edit ? null : (
            <Layout.Horizontal flex>
              <VisualYamlToggle
                selectedView={mode}
                onChange={nextMode => {
                  setMode(nextMode)
                }}
              />
              <RbacButton
                text={getString('editDetails')}
                icon="edit"
                onClick={handleEdit}
                permission={{
                  permission: PermissionIdentifier.UPDATE_SECRET,
                  resource: {
                    resourceType: ResourceType.SECRET,
                    resourceIdentifier: secretData.secret.identifier
                  }
                }}
                variation={ButtonVariation.PRIMARY}
              />
            </Layout.Horizontal>
          )}
        </Container>
        {mode === SelectedView.YAML ? (
          <YAMLSecretDetails refetch={props.refetch} secretData={secretData} edit={edit} setEdit={setEdit} />
        ) : (
          //View in Visual Mode
          <ViewSecretDetails secret={secretData} />
        )}
      </Container>
    </>
  )
}

export default SecretDetails
