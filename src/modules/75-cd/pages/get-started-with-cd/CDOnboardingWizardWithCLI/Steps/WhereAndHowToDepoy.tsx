import React from 'react'
import { Color } from '@harness/design-system'
import { Layout, Text, Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import delegateImage from '@cd/modals/images/delegate.svg'
import VerifyDelegateConnection from '@delegates/pages/delegates/delegateCommandLineCreation/components/VerifyDelegateConnection'
import { CDOnboardingSteps, WhereAndHowToDeployType } from '../types'

import DelegateModal, { DelgateDetails } from '../DelegateModal'
import css from '../CDOnboardingWizardWithCLI.module.scss'

interface WhereAndHowToDepoyProps {
  saveProgress: (stepId: string, data: any) => void
}
function WhereAndHowToDepoy({ saveProgress }: WhereAndHowToDepoyProps): JSX.Element {
  const [state, setState] = React.useState<WhereAndHowToDeployType>({ isDelegateVerified: false })
  const [isDrawerOpen, setDrawerOpen] = React.useState<boolean>(false)

  const { getString } = useStrings()

  const openDelagateDialog = (): void => {
    setDrawerOpen(true)
  }
  const closeDelegateDialog = (data: DelgateDetails): void => {
    if (data?.delegateName && data?.delegateType) {
      setState(prevState => ({
        ...prevState,
        delegateName: data.delegateName as string,
        delegateType: data.delegateType as any
      }))
    }
    setDrawerOpen(false)
  }
  const onSuccessHandler = React.useCallback((): void => {
    setState(prevState => ({ ...prevState, isDelegateVerified: true }))
  }, [state.isDelegateVerified])

  const onErrorHandler = React.useCallback((): void => {
    setState(prevState => ({ ...prevState, isDelegateVerified: false }))
  }, [state.isDelegateVerified])

  React.useEffect(() => {
    saveProgress(CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY, state)
  }, [state])

  return (
    <Layout.Vertical>
      <Layout.Vertical>
        <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
          {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.installDelegate')}
        </Text>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.delegateDescription')}
        </Text>
        <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
          {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.delegateDescription2')}
        </Text>
        <Layout.Vertical margin={{ bottom: 'xlarge' }}>
          <img src={delegateImage} className={css.delegateImg} />
        </Layout.Vertical>
        <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
          {getString('common.howItWorks')}
        </Text>
        <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
          {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.howDeleagteWorks')}
        </Text>
        {!state.isDelegateVerified && (
          <Button variation={ButtonVariation.PRIMARY} width={'fit-content'} onClick={openDelagateDialog}>
            {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdPipeline.installButton')}
          </Button>
        )}
        <Layout.Vertical margin={{ bottom: 'large' }}>
          <DelegateModal onClose={closeDelegateDialog} hideDocker isOpen={isDrawerOpen} />
        </Layout.Vertical>

        {state?.delegateName && state?.delegateType && !isDrawerOpen && (
          <VerifyDelegateConnection
            delegateType={state.delegateType}
            name={state.delegateName as string}
            onSuccessHandler={onSuccessHandler}
            onDone={() => {
              //
            }}
            showDoneButton={false}
            onErrorHandler={onErrorHandler}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default WhereAndHowToDepoy
