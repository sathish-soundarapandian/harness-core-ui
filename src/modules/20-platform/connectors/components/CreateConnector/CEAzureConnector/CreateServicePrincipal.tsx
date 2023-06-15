/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
// import { useParams } from 'react-router-dom'
import { Button, Container, Heading, Layout, StepProps, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
// import { ConnectorInfoDTO, ConnectorRequestBody, useCreateConnector } from 'services/cd-ng'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useGetAppId } from 'services/lw'
import css from './CreateCeAzureConnector.module.scss'

interface CreateServicePrincipalProps {
  name: string
}

interface CLITextWithCommentProps {
  command: string
  comment: string
}

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

const CreateServicePrincipal: React.FC<StepProps<StepSecretManagerProps> & CreateServicePrincipalProps> = props => {
  const { getString } = useStrings()
  // const { accountId, orgIdentifier, projectIdentifier } = useParams<{
  //   accountId: string
  //   orgIdentifier: string
  //   projectIdentifier: string
  // }>()
  // const [isSaving, setIsSaving] = useState(false)
  // const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })

  const saveAndContinue = async (): Promise<void> => {
    // setIsSaving(true)
    // try {
    // modalErrorHandler?.hide()
    // const connector: ConnectorRequestBody = { connector: props.prevStepData as ConnectorInfoDTO }
    // await createConnector(connector)
    // setIsSaving(false)
    props.nextStep?.({ ...props.prevStepData } as ConnectorInfoDTO)
    // } catch (e) {
    //   setIsSaving(false)
    // modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    // }
  }
  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        Create Service Principle
      </Heading>
      <ServicePrincipalCLI meta={{ subscriptionId: props.prevStepData?.spec.subscriptionId }} />
      <Button
        type="submit"
        intent="primary"
        text={getString('continue')}
        rightIcon="chevron-right"
        // loading={isSaving}
        // disabled={isSaving}
        onClick={() => saveAndContinue()}
        className={css.submitBtn}
      />
    </Layout.Vertical>
  )
}

const CLITextWithComment: React.FC<CLITextWithCommentProps> = ({ command, comment }) => {
  return (
    <>
      <Text>{comment}</Text>
      <pre>{command}</pre>
    </>
  )
}

interface ServicePrincipalCLIProps {
  meta: Record<string, string>
}

const ServicePrincipalCLI: React.FC<ServicePrincipalCLIProps> = props => {
  const { data } = useGetAppId({})
  const appId = data?.response?.app_id
  return (
    <Container style={{ flex: 1 }}>
      <Text className={css.subHeader}>
        You can Create a Service Principal and assign permissions by running the following commands in the Command line
      </Text>
      <div className={css.commandsContainer}>
        <CLITextWithComment
          comment={'# Register the Harness app'}
          command={`az ad sp create --id ${appId ?? '<app_id_for_the_env>'} | jq '.objectId'`}
        />
        {/* <CLITextWithComment
          comment={'# Role is assigned to this scope'}
          command={'SCOPE=`az storage account show --name cesrcbillingstorage --query "id" | xargs`'}
        /> */}
        <CLITextWithComment
          comment={'# Assign role to the app on the scope fetched above'}
          command={`az role assignment create --assignee-object-id <output_of_first_command_execution> --role b24988ac-6180-42a0-ab88-20f7382dd24c --scope /subscriptions/${props.meta.subscriptionId}`}
        />
      </div>
    </Container>
  )
}

export default CreateServicePrincipal
