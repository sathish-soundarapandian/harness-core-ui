/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Dialog,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  PageSpinner,
  Text,
  useToaster
} from '@harness/uicore'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { capitalize, defaultTo, get, isEmpty } from 'lodash-es'
import { useModalHook } from '@harness/use-modal'
import { Classes, IDialogProps } from '@blueprintjs/core'
import { StringKeys, useStrings } from 'framework/strings'
import { useGetDelegateGroupByIdentifier } from 'services/portal'
import type { ServiceDefinition, UserRepoResponse } from 'services/cd-ng'
import { StringUtils } from '@common/exports'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { createPipelineV2Promise, ResponsePipelineSaveResponse, useGetInputsetYaml } from 'services/pipeline-ng'
import { Status } from '@common/utils/Constants'
import { useGetServicesData } from '@cd/components/PipelineSteps/DeployServiceEntityStep/useGetServicesData'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import {
  DEFAULT_PIPELINE_NAME,
  DEFAULT_PIPELINE_PAYLOAD,
  EMPTY_STRING,
  getUniqueEntityIdentifier,
  PipelineRefPayload
} from '../CDOnboardingUtils'
import { DeployProvisiongWizardStepId } from '../DeployProvisioningWizard/Constants'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import successSetup from '../../home/images/success_setup.svg'
import css from './RunPipelineSummary.module.scss'
import moduleCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

interface RunPipelineSummaryProps {
  onSuccess: () => void
  setSelectedSectionId: React.Dispatch<React.SetStateAction<DeployProvisiongWizardStepId>>
  setLoader: React.Dispatch<React.SetStateAction<boolean>>
}

const RunPipelineSummary = ({ onSuccess, setSelectedSectionId, setLoader }: RunPipelineSummaryProps): JSX.Element => {
  const {
    state: { service, delegate, infrastructure, environment }
  } = useCDOnboardingContext()
  const { showError } = useToaster()

  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const { data: delegateDetails } = useGetDelegateGroupByIdentifier({
    identifier: delegate?.delegateIdentifier as string,
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier },
    lazy: !delegate?.delegateIdentifier
  })

  const environmentEntites: Record<string, string> = {
    connector: delegate?.environmentEntities?.connector as string,
    environment: delegate?.environmentEntities?.environment as string,
    infrastructureText: delegate?.environmentEntities?.infrastructure as string,
    'common.namespace': delegate?.environmentEntities?.namespace as string
  }

  const delegateConnectivityDetails = React.useMemo(() => {
    const isConnected = !!delegateDetails?.resource?.activelyConnected
    const text = isConnected ? getString('connected') : getString('delegate.notConnected')
    return {
      isConnected,
      text
    }
  }, [delegateDetails])

  const serviceEntities: Record<string, string> = {
    'cd.getStartedWithCD.serviceName': service?.name as string,
    'cd.getStartedWithCD.manifestTypeSelection': service?.serviceDefinition?.spec?.manifests?.[0]?.manifest
      ?.type as string,
    'cd.getStartedWithCD.manifestStorage': service?.serviceDefinition?.spec?.manifests?.[0]?.manifest?.spec?.store
      ?.type as string,
    'cd.getStartedWithCD.artifactStorage': defaultTo(
      service?.serviceDefinition?.spec?.artifacts?.primary?.sources?.[0]?.type,
      '-'
    )
  }
  const successsFullConfiguration = (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
      <Icon name="success-tick" />
      <Text font="normal" color={Color.GREEN_700}>
        {capitalize(getString('success'))}
      </Text>
    </Layout.Horizontal>
  )

  const [inputSetYaml, setInputSetYaml] = React.useState(EMPTY_STRING)
  const [pipelineIdentifier, setPipelineIdentifier] = React.useState<string>(EMPTY_STRING)
  function onCloseRunPipelineModal(): void {
    closeRunPipelineModal()
    setInputSetYaml(EMPTY_STRING)
  }

  const runModalProps: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: cx(moduleCss.runPipelineDialog, Classes.DIALOG),
    isCloseButtonShown: false
  }
  const { data: inputSetYAMLData, loading } = useGetInputsetYaml({
    planExecutionId: EMPTY_STRING,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  React.useEffect(() => {
    if (inputSetYAMLData) {
      ;(inputSetYAMLData as unknown as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [inputSetYAMLData])

  const { servicesData } = useGetServicesData({
    gitOpsEnabled: false,
    serviceIdentifiers: [service?.identifier as string],
    deploymentType: service?.serviceDefinition?.type as ServiceDefinition['type']
  })

  const serviceInputsObj = React.useMemo(() => {
    const service1 = servicesData.find(svc => svc.service.identifier === service?.identifier)

    if (isEmpty(service1?.serviceInputs)) {
      return {
        serviceRef: service?.identifier
      }
    } else {
      return {
        serviceRef: service?.identifier,
        serviceInputs: { ...service1?.serviceInputs }
      }
    }
  }, [service?.identifier, servicesData])

  const constructPipelinePayload = React.useCallback(
    (data: PipelineRefPayload, repository = { name: DEFAULT_PIPELINE_NAME } as UserRepoResponse): string => {
      const { name: repoName } = repository
      const { serviceRef, environmentRef, infraStructureRef, deploymentType } = data

      if (!repoName || !serviceRef || !environmentRef || !infraStructureRef) {
        return EMPTY_STRING
      }
      const constructPipelineName = (name: string): string =>
        `${getString('pipelineSteps.deploy.create.deployStageName')}_${StringUtils.getIdentifierFromName(name)}`

      const uniquePipelineId = getUniqueEntityIdentifier(repoName)
      const userPipelineIdentifier = constructPipelineName(uniquePipelineId)

      const payload = DEFAULT_PIPELINE_PAYLOAD
      payload.pipeline.name = constructPipelineName(repoName)
      payload.pipeline.identifier = userPipelineIdentifier
      payload.pipeline.projectIdentifier = projectIdentifier
      payload.pipeline.orgIdentifier = orgIdentifier
      payload.pipeline.stages[0].stage.spec.deploymentType = deploymentType
      payload.pipeline.stages[0].stage.spec.service = serviceInputsObj
      payload.pipeline.stages[0].stage.spec.environment.environmentRef = environmentRef
      payload.pipeline.stages[0].stage.spec.environment.infrastructureDefinitions[0].identifier = infraStructureRef
      setPipelineIdentifier(userPipelineIdentifier)
      try {
        return yamlStringify(payload)
      } catch (e) {
        // Ignore error
        return EMPTY_STRING
      }
    },
    [getString, projectIdentifier, orgIdentifier, serviceInputsObj]
  )

  const setupPipeline = (data: PipelineRefPayload): void => {
    try {
      createPipelineV2Promise({
        body: constructPipelinePayload(data, get(service, 'data.repoValues')),
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then((createPipelineResponse: ResponsePipelineSaveResponse) => {
        const { status } = createPipelineResponse
        if (status === Status.SUCCESS && createPipelineResponse?.data?.identifier) {
          if (createPipelineResponse?.data?.identifier) {
            setLoader(false)
            openRunPipelineModal()
          }
        }
      })
    } catch (e: any) {
      setLoader(false)
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  const [openRunPipelineModal, closeRunPipelineModal] = useModalHook(
    () =>
      loading ? (
        <PageSpinner />
      ) : (
        <Dialog {...runModalProps}>
          <Layout.Vertical>
            <RunPipelineForm
              pipelineIdentifier={pipelineIdentifier}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              accountId={accountId}
              module={'cd'}
              inputSetYAML={inputSetYaml || EMPTY_STRING}
              source="executions"
              onClose={() => {
                onCloseRunPipelineModal()
              }}
              storeType={'INLINE'}
            />
            <Button
              aria-label="close modal"
              minimal
              icon="cross"
              iconProps={{ size: 20 }}
              onClick={() => {
                onCloseRunPipelineModal()
              }}
              className={moduleCss.crossIcon}
            />
          </Layout.Vertical>
        </Dialog>
      ),
    [loading, inputSetYaml, pipelineIdentifier]
  )

  const onSuccessHandler = (): void => {
    const refsData = {
      serviceRef: service?.identifier as string,
      environmentRef: environment?.identifier as string,
      infraStructureRef: infrastructure?.identifier as string,
      deploymentType: service?.serviceDefinition?.type as string
    }
    setupPipeline(refsData)

    onSuccess()
  }

  return (
    <Container className={css.container} width="50%">
      <Layout.Vertical padding="xxlarge">
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'large' }}>
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xxlarge' }}>
              {getString('cd.getStartedWithCD.allSet')}
            </Text>

            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              padding={{ bottom: 'medium' }}
            >
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('cd.getStartedWithCD.deploymentType')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.SelectDeploymentType)}
              />
            </Layout.Horizontal>
            <Text margin={{ left: 'medium' }} font="normal">
              {service?.serviceDefinition?.type}
            </Text>
          </Layout.Vertical>

          <img className={css.successImage} src={successSetup} />
        </Layout.Horizontal>
        <Container className={css.borderBottomClass} />

        {/* ENVIRONMENT */}

        <Layout.Vertical padding={{ bottom: 'large' }}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('common.connectEnvironment')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.Deploy)}
              />
            </Layout.Horizontal>
            {successsFullConfiguration}
          </Layout.Horizontal>
          <Text style={{ lineHeight: '28px' }} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.delegateRunAs')}
          </Text>

          <Container flex={{ justifyContent: 'space-between' }}>
            <Text margin={{ left: 'medium' }} style={{ lineHeight: '28px' }} font="normal">
              {delegate?.delegateType as string}
            </Text>
            <Text
              icon="full-circle"
              iconProps={{
                size: 6,
                color: delegateConnectivityDetails?.isConnected ? Color.GREEN_600 : Color.GREY_400,
                padding: 'small'
              }}
            >
              {delegateConnectivityDetails?.text}
            </Text>
          </Container>

          <Text style={{ lineHeight: '28px' }} font={{ variation: FontVariation.BODY1 }}>
            {getString('cd.getStartedWithCD.environmentDetails')}
          </Text>
          {Object.keys(environmentEntites).map(entity => {
            return (
              <Text margin={{ left: 'medium' }} key={entity} style={{ lineHeight: '28px' }} font="normal">
                {getString(entity as StringKeys)}: {environmentEntites[entity]}
              </Text>
            )
          })}
        </Layout.Vertical>
        <Container className={css.borderBottomClass} />

        {/* SERVICE */}

        <Layout.Vertical padding={{ bottom: 'large' }}>
          <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text font={{ variation: FontVariation.H5 }} padding={{ right: 'medium' }}>
                {getString('cd.getStartedWithCD.serviceConfiguration')}
              </Text>
              <Icon
                name="Edit"
                size={18}
                color={Color.PRIMARY_7}
                onClick={() => setSelectedSectionId(DeployProvisiongWizardStepId.Configure)}
              />
            </Layout.Horizontal>
            {successsFullConfiguration}
          </Layout.Horizontal>
          {Object.keys(serviceEntities).map(entity => {
            return (
              <Text margin={{ left: 'medium' }} key={entity} style={{ lineHeight: '28px' }} font="normal">
                {getString(entity as StringKeys)}: {serviceEntities[entity]}
              </Text>
            )
          })}
        </Layout.Vertical>
        <Container className={css.borderBottomClass} />

        <Layout.Horizontal>
          <Button
            onClick={onSuccessHandler}
            intent="success"
            variation={ButtonVariation.PRIMARY}
            text={getString('runPipeline')}
            padding="xlarge"
            size={ButtonSize.MEDIUM}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

export default RunPipelineSummary
