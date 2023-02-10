import React, { useEffect, useState } from 'react'
import {
  Text,
  Button,
  Layout,
  ButtonVariation,
  ButtonSize,
  useToaster,
  getErrorInfoFromErrorObject,
  TextInput,
  Label
} from '@harness/uicore'
import { FontVariation, Intent, Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { HideModal } from '@harness/use-modal'
import DelegatesEmptyState from '@delegates/images/DelegatesEmptyState.svg'
import { useStrings } from 'framework/strings'
import { useGetInstallationCommand } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  CommandType,
  DelegateCommandLineTypes,
  DelegateCommonProblemTypes,
  DelegateDefaultName,
  DelegateNameLengthLimit,
  KubernetesType
} from '@delegates/constants'
import { useGenerateTerraformModule } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, DelegateActions } from '@common/constants/TrackingConstants'
import { delegateNameRegex } from '@delegates/components/CreateDelegate/DockerDelegate/Step1Setup/Step1Setup'
import VerifyDelegateConnection from './components/VerifyDelegateConnection'
import DockerCommands from './components/DockerCommands'
import TerraFormCommands from './components/TerraFormCommands'
import KubernetesManifestCommands from './components/KubernetesManifestCommands'
import HelmChartCommands from './components/HelmChartCommands'
import css from './DelegateCommandLineCreation.module.scss'

interface DelegateCommandLineCreationProps {
  onDone: HideModal
  oldDelegateCreation?: () => void
}
interface CommonStatesforAllClicksProps {
  commandTypeLocal: CommandType | undefined
  delegateNameLocal: string
  delegateDefaultNameLocal: string
  commonProblemsDelegateTypeLocal: DelegateCommonProblemTypes | undefined
}

const installDelegateLink =
  'https://developer.harness.io/docs/platform/Delegates/get-started-with-delegates/delegates-overview'
const intsallDelegateLinkTutorial = 'https://developer.harness.io/tutorials/platform/install-delegate'

const DelegateCommandLineCreation: React.FC<DelegateCommandLineCreationProps> = ({ onDone, oldDelegateCreation }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [delegateType, setDelegateType] = useState<DelegateCommandLineTypes>(DelegateCommandLineTypes.KUBERNETES)
  const [kubernetesType, setkubernetesType] = useState<KubernetesType | undefined>(KubernetesType.HELM_CHART)
  const [commandType, setCommandType] = useState<CommandType | undefined>(CommandType.HELM)
  const [command, setCommand] = useState<string>('')
  const [errorDelegateName, setErrorDelegateName] = useState<boolean>(false)
  const [errorDelegateNameLength, setErrorDelegateNameLength] = useState<boolean>(false)
  const [delegateDefaultName, setDelegateDefaultName] = useState<string>(DelegateDefaultName.HELM)
  const [originalCommand, setOriginalCommand] = useState<string>('')
  const [commonProblemsDelegateType, setCommonProblemsDelegateType] = useState<DelegateCommonProblemTypes | undefined>(
    DelegateCommonProblemTypes.HELM_CHART
  )
  const { showError } = useToaster()
  const [verifyButtonClicked, setVerifyButtonClicked] = useState<boolean>(false)
  const [delegateName, setDelegateName] = useState<string>(DelegateDefaultName.HELM)
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(true)
  const { trackEvent } = useTelemetry()
  const {
    data: terraFormData,
    error: terraformError,
    refetch: getTerraFormCommand
  } = useGenerateTerraformModule({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const setTerraFormDataToCommand = () => {
    if (terraFormData) {
      setCommand(terraFormData)
      setOriginalCommand(terraFormData)
    }
  }
  useEffect(() => {
    if (terraFormData && commandType === CommandType.TERRAFORM) {
      setTerraFormDataToCommand()
    }
  }, [terraFormData])

  const {
    refetch,
    data: commandData,
    error
  } = useGetInstallationCommand({
    queryParams: { accountId, commandType, orgId: orgIdentifier, projectId: projectIdentifier },
    lazy: true
  })
  useEffect(() => {
    if (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }, [error])
  useEffect(() => {
    if (terraformError) {
      showError(getErrorInfoFromErrorObject(terraformError))
    }
  }, [terraformError])

  useEffect(() => {
    if (commandType) {
      setCommand('')
      setOriginalCommand('')
      if (commandType === CommandType.TERRAFORM) {
        if (!terraFormData) {
          getTerraFormCommand()
        } else {
          setTerraFormDataToCommand()
        }
      } else {
        refetch({ queryParams: { accountId, commandType, orgId: orgIdentifier, projectId: projectIdentifier } })
      }
    }
  }, [commandType])
  useEffect(() => {
    if (commandData && commandData?.resource && commandData?.resource['command']) {
      setCommand(commandData?.resource['command'])
      setOriginalCommand(commandData?.resource['command'])
    }
  }, [commandData])
  const commonCommandsForAllDelegateTypes = () => {
    setVerifyButtonClicked(false)
    setErrorDelegateName(false)
    setErrorDelegateNameLength(false)
    setShowVerifyButton(true)
  }

  const commonStatesforAllClicks = ({
    commandTypeLocal,
    delegateNameLocal,
    delegateDefaultNameLocal,
    commonProblemsDelegateTypeLocal
  }: CommonStatesforAllClicksProps) => {
    setCommandType(commandTypeLocal)
    setDelegateName(delegateNameLocal)
    setDelegateDefaultName(delegateDefaultNameLocal)
    setCommonProblemsDelegateType(commonProblemsDelegateTypeLocal)
    commonCommandsForAllDelegateTypes()
  }
  const onDelegateError = () => {
    setShowVerifyButton(false)
  }
  const checkIfErrorBlockAlreadyVisible = () => {
    if (!showVerifyButton && verifyButtonClicked) {
      setShowVerifyButton(true)
    }
    setVerifyButtonClicked(false)
  }
  const kubernetesDelegateButtons = (
    <Layout.Horizontal spacing="none" margin={{ bottom: 'xlarge', top: 'none' }}>
      <Button
        size={ButtonSize.SMALL}
        className={css.kubernetesButtons}
        round
        onClick={() => {
          commonStatesforAllClicks({
            commandTypeLocal: CommandType.HELM,
            delegateNameLocal: DelegateDefaultName.HELM,
            delegateDefaultNameLocal: DelegateDefaultName.HELM,
            commonProblemsDelegateTypeLocal: DelegateCommonProblemTypes.HELM_CHART
          })
          setkubernetesType(KubernetesType.HELM_CHART)
          trackEvent(DelegateActions.DelegateCommandLineHelm, {
            category: Category.DELEGATE
          })
        }}
        text={getString('common.HelmChartLabel')}
        intent={kubernetesType === KubernetesType.HELM_CHART ? 'primary' : 'none'}
      ></Button>
      <Button
        size={ButtonSize.SMALL}
        className={css.kubernetesButtons}
        onClick={() => {
          commonStatesforAllClicks({
            commandTypeLocal: CommandType.TERRAFORM,
            delegateNameLocal: DelegateDefaultName.TERRAFORM,
            delegateDefaultNameLocal: DelegateDefaultName.TERRAFORM,
            commonProblemsDelegateTypeLocal: DelegateCommonProblemTypes.TERRAFORM
          })
          setkubernetesType(KubernetesType.TERRAFORM)
          trackEvent(DelegateActions.DelegateCommandLineTerraform, {
            category: Category.DELEGATE
          })
        }}
        intent={kubernetesType === KubernetesType.TERRAFORM ? 'primary' : 'none'}
        round
        text={getString('delegates.commandLineCreation.terraForm')}
      ></Button>
      <Button
        size={ButtonSize.SMALL}
        onClick={() => {
          commonStatesforAllClicks({
            commandTypeLocal: undefined,
            delegateNameLocal: '',
            delegateDefaultNameLocal: '',
            commonProblemsDelegateTypeLocal: DelegateCommonProblemTypes.KUBERNETES_MANIFEST
          })
          setkubernetesType(KubernetesType.KUBERNETES_MANIFEST)
          trackEvent(DelegateActions.DelegateCommandLineKubernetesManifest, {
            category: Category.DELEGATE
          })
        }}
        intent={kubernetesType === KubernetesType.KUBERNETES_MANIFEST ? 'primary' : 'none'}
        round
        text={getString('delegates.commandLineCreation.kubernetesManifest')}
      ></Button>
    </Layout.Horizontal>
  )
  const delegateNameError = () => {
    let errorMessage = undefined
    if (errorDelegateName) {
      errorMessage = getString('delegates.delegateNameRegexIssue')
    }
    if (errorDelegateNameLength) {
      const lengthMessage = getString('delegates.delegateNameLength', { length: DelegateNameLengthLimit })
      errorMessage = errorMessage ? `${errorMessage}${lengthMessage}` : lengthMessage
    }
    return errorMessage
  }
  const delegateNameInput = (
    <Layout.Vertical margin={{ bottom: 'xlarge' }}>
      <Label>{getString('delegate.delegateName')}</Label>
      <TextInput
        className={css.delegateNameText}
        value={delegateName}
        errorText={delegateNameError()}
        maxLength={DelegateNameLengthLimit + 1}
        placeholder={getString('delegate.delegateName')}
        intent={errorDelegateName || errorDelegateNameLength ? Intent.DANGER : Intent.NONE}
        onChange={e => {
          const latestValue = (e.currentTarget as HTMLInputElement).value.trim()
          const delegateNameSchema = Yup.object({
            name: Yup.string().trim().matches(delegateNameRegex)
          })
          const delegateLengthSchema = Yup.object({
            name: Yup.string().trim().max(DelegateNameLengthLimit)
          })
          const validText = delegateNameSchema.isValidSync({ name: latestValue })
          const validTextLength = delegateLengthSchema.isValidSync({ name: latestValue })
          setErrorDelegateNameLength(!validTextLength)
          setErrorDelegateName(!validText)
          checkIfErrorBlockAlreadyVisible()
          setDelegateName(latestValue)
          setCommand(originalCommand.replace(new RegExp(delegateDefaultName, 'g'), latestValue))
        }}
      />
    </Layout.Vertical>
  )
  const shouldDisplayDelegateConnection = () =>
    (delegateType === DelegateCommandLineTypes.DOCKER ||
      (delegateType === DelegateCommandLineTypes.KUBERNETES && kubernetesType)) &&
    (command ||
      (delegateType === DelegateCommandLineTypes.KUBERNETES && kubernetesType === KubernetesType.KUBERNETES_MANIFEST))
  const verifyDelegateConnection = (
    <>
      {shouldDisplayDelegateConnection() && (
        <>
          <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'xlarge' }}>
            {getString('delegates.commandLineCreation.verifyDelegateConnection')}
          </Text>
          {showVerifyButton && (
            <>
              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                spacing="none"
                margin={{ bottom: 'xlarge' }}
              >
                <Button
                  disabled={!delegateName || errorDelegateName || errorDelegateNameLength}
                  variation={ButtonVariation.SECONDARY}
                  text={getString('verify')}
                  onClick={() => {
                    setVerifyButtonClicked(true)
                    setShowVerifyButton(false)
                  }}
                  margin={{ right: 'xlarge' }}
                />
                <Text font={{ variation: FontVariation.BODY }}>
                  {getString('delegates.commandLineCreation.verifyInfo')}
                </Text>
              </Layout.Horizontal>
            </>
          )}
          {verifyButtonClicked && (
            <VerifyDelegateConnection
              onErrorHandler={onDelegateError}
              onDone={onDone}
              name={delegateName}
              delegateType={commonProblemsDelegateType}
            />
          )}
        </>
      )}
    </>
  )
  const displayKubernetsButtons = () => {
    return <> {delegateType === DelegateCommandLineTypes.KUBERNETES && kubernetesDelegateButtons}</>
  }
  const displayDelegateNameInput = () => {
    return <>{(delegateType === DelegateCommandLineTypes.DOCKER || kubernetesType) && delegateNameInput}</>
  }
  const displayDockerDetails = () => {
    return <>{delegateType === DelegateCommandLineTypes.DOCKER && <DockerCommands command={command} />}</>
  }
  const displayKubernetesDelegateDetails = () => {
    return (
      <>
        {delegateType === DelegateCommandLineTypes.KUBERNETES && (
          <>
            <>{kubernetesType === KubernetesType.HELM_CHART && <HelmChartCommands command={command} />}</>
            <>{kubernetesType === KubernetesType.KUBERNETES_MANIFEST && <KubernetesManifestCommands />}</>
            <>{kubernetesType === KubernetesType.TERRAFORM && <TerraFormCommands command={command} />}</>
          </>
        )}
      </>
    )
  }
  return (
    <>
      <Layout.Horizontal padding="xxlarge" spacing="large" height="98%">
        <Layout.Vertical width="80%">
          <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
            <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
              {getString('delegates.newDelegate')}
            </Text>
            {oldDelegateCreation && (
              <Button
                variation={ButtonVariation.LINK}
                onClick={() => {
                  if (oldDelegateCreation) {
                    trackEvent(DelegateActions.SwitchedToOldDelegateCreationModal, {
                      category: Category.DELEGATE
                    })
                    oldDelegateCreation()
                    onDone()
                  }
                }}
                text={getString('delegates.commandLineCreation.oldWayToCreateDelegate')}
              />
            )}
          </Layout.Horizontal>
          <Text font={{ variation: FontVariation.SMALL }} margin={{ bottom: 'xxlarge' }}>
            {getString('delegates.commandLineCreation.installDelegateSubText')}{' '}
            <a target="_blank" rel="noreferrer" href={installDelegateLink}>
              {getString('common.learnMoreDelegate')}
            </a>
          </Text>
          <Layout.Vertical height="99%" padding={{ bottom: 'xxlarge' }} className={css.delegateDetails}>
            <Text
              font={{ variation: FontVariation.H4 }}
              margin={{ bottom: 'medium' }}
              tooltipProps={{ dataTooltipId: 'delegates.commandLineCreation.selectyourDelegate' }}
            >
              {getString('delegates.commandLineCreation.selectyourDelegate')}
            </Text>

            <Layout.Horizontal spacing="margin-form-field" margin={{ bottom: 'xxxlarge' }}>
              <Button
                icon="service-kubernetes"
                className={css.kubernetesButtons}
                onClick={() => {
                  commonStatesforAllClicks({
                    commandTypeLocal: undefined,
                    delegateNameLocal: '',
                    delegateDefaultNameLocal: DelegateDefaultName.TERRAFORM,
                    commonProblemsDelegateTypeLocal: undefined
                  })
                  setDelegateType(DelegateCommandLineTypes.KUBERNETES)
                  trackEvent(DelegateActions.DelegateCommandLineKubernetes, {
                    category: Category.DELEGATE
                  })
                }}
                text={getString('kubernetesText')}
                round
                intent={delegateType === DelegateCommandLineTypes.KUBERNETES ? 'primary' : 'none'}
              ></Button>
              <Button
                intent={delegateType === DelegateCommandLineTypes.DOCKER ? 'primary' : 'none'}
                onClick={() => {
                  commonStatesforAllClicks({
                    commandTypeLocal: CommandType.DOCKER,
                    delegateNameLocal: DelegateDefaultName.DOCKER,
                    delegateDefaultNameLocal: DelegateDefaultName.DOCKER,
                    commonProblemsDelegateTypeLocal: DelegateCommonProblemTypes.DOCKER
                  })

                  setDelegateType(DelegateCommandLineTypes.DOCKER)
                  setkubernetesType(undefined)
                  trackEvent(DelegateActions.DelegateCommandLineDocker, {
                    category: Category.DELEGATE
                  })
                }}
                icon="docker-step"
                text={getString('delegate.cardData.docker.name')}
                round
              ></Button>
            </Layout.Horizontal>
            {delegateType && (
              <Text
                font={{ variation: FontVariation.H4 }}
                margin={{ bottom: 'medium' }}
                tooltipProps={{ dataTooltipId: 'delegates.commandLineCreation.installYourDelegate' }}
              >
                {getString('delegates.commandLineCreation.installYourDelegate')}
              </Text>
            )}
            {displayKubernetsButtons()}
            {displayDelegateNameInput()}
            {displayDockerDetails()}
            {displayKubernetesDelegateDetails()}

            {(delegateType === DelegateCommandLineTypes.DOCKER || kubernetesType) && (
              <Text
                font={{ variation: FontVariation.SMALL }}
                margin={{ bottom: 'xxxlarge' }}
                rightIcon="launch"
                color={Color.PRIMARY_7}
                rightIconProps={{
                  className: css.iconPointer,
                  onClick: () => {
                    window.open(intsallDelegateLinkTutorial, '_blank', 'noreferrer')
                  }
                }}
              >
                <a target="_blank" rel="noreferrer" href={intsallDelegateLinkTutorial}>
                  {getString('delegates.commandLineCreation.forAdvancedConfig')}
                </a>
              </Text>
            )}
            {verifyDelegateConnection}
          </Layout.Vertical>
        </Layout.Vertical>
        <Layout.Vertical width="20%" spacing="xxxlarge" padding={{ right: 'xxxlarge' }}>
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('delegates.commandLineCreation.harenssDelegates')}
          </Text>
          <img src={DelegatesEmptyState} />
          <Text font={{ variation: FontVariation.BODY }}>{getString('delegates.commandLineCreation.infoText')}</Text>
          <Text
            font={{ variation: FontVariation.SMALL }}
            rightIcon="launch"
            color={Color.PRIMARY_7}
            rightIconProps={{
              className: css.iconPointer,
              onClick: () => {
                window.open(installDelegateLink, '_blank', 'noreferrer')
              }
            }}
          >
            <a target="_blank" rel="noreferrer" href={installDelegateLink}>
              {getString('delegates.commandLineCreation.learnWatch')}
            </a>
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}
export default DelegateCommandLineCreation
