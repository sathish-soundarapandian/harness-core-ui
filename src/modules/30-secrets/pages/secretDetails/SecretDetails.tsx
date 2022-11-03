/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { isEmpty, omit, without, defaultTo } from 'lodash-es'
import {
  Layout,
  Container,
  Button,
  ButtonVariation,
  VisualYamlSelectedView as SelectedView,
  useConfirmationDialog,
  useToaster,
  VisualYamlToggle
} from '@wings-software/uicore'

import {
  SecretTextSpecDTO,
  usePutSecretViaYaml,
  ResponseSecretResponseWrapper,
  useGetYamlSchema,
  SecretResponseWrapper
} from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import { useCreateWinRmCredModal } from '@secrets/modals/CreateWinRmCredModal/useCreateWinRmCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import type { ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'

import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
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
  const [secretDataState, setSecretDataState] = React.useState<SecretResponseWrapper>(secretData)
  const [hasValidationErrors, setHasValidationErrors] = React.useState<boolean>(false)
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

  const handleChange = React.useCallback(() => {
    requestAnimationFrame(() => {
      setSecretDataState(parse(yamlHandler?.getLatestYaml() || ''))
      setHasValidationErrors(!isEmpty(yamlHandler?.getYAMLValidationErrorMap()))
    })
  }, [yamlHandler])

  return (
    <Container>
      {edit && (
        <>
          <YamlBuilderMemo
            entityType={'Secrets'}
            fileName={`${secretDataState.secret.name}.yaml`}
            existingJSON={omit(secretDataState, fieldsRemovedFromYaml)}
            bind={setYamlHandler}
            height="calc(100vh - 350px)"
            schema={secretSchema?.data}
            isReadOnlyMode={false}
            yamlSanityConfig={yamlSanityConfig}
            onChange={handleChange}
          />
          <Layout.Horizontal spacing="medium">
            <Button
              intent="primary"
              text={getString('save')}
              onClick={handleSaveYaml}
              margin={{ top: 'large' }}
              variation={ButtonVariation.PRIMARY}
              disabled={hasValidationErrors}
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
        <YamlBuilderMemo
          entityType={'Secrets'}
          existingJSON={omit(secretDataState, fieldsRemovedFromYaml)}
          fileName={`${secretDataState.secret.name}.yaml`}
          height="calc(100vh - 350px)"
          isReadOnlyMode={true}
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
      <Container padding={{ right: 'huge' }}>
        {mode === SelectedView.YAML ? (
          <>
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
            <YAMLSecretDetails refetch={props.refetch} secretData={secretData} edit={edit} setEdit={setEdit} />
          </>
        ) : (
          //View in Visual Mode
          <ViewSecretDetails edit={edit} mode={mode} setMode={setMode} handleEdit={handleEdit} secret={secretData} />
        )}
      </Container>
    </>
  )
}

export default SecretDetails
