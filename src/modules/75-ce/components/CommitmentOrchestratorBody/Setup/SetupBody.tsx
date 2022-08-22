/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, pick } from 'lodash-es'
import { Button, ButtonVariation, Checkbox, Container, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useSaveSetupCO } from 'services/lw-co'
import SetupSteps from './SetupSteps'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import { SetupContext, SetupData, UpfrontPaymentMethods } from './SetupContext'
import css from './Setup.module.scss'

enum StepsCount {
  first = 0,
  second = 1,
  third = 2,
  fourth = 3
}

const SetupBody: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { getString } = useStrings()

  const [activeStep, setActiveStep] = useState(StepsCount.first)
  const [setupData, setSetupData] = useState<SetupData>()

  const { mutate: saveSetupConfig } = useSaveSetupCO({
    accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const stepCountToComponentMap: Record<StepsCount, React.ReactNode> = useMemo(() => {
    return {
      [StepsCount.first]: <Step1 />,
      [StepsCount.second]: <Step2 />,
      [StepsCount.third]: <Step3 />,
      [StepsCount.fourth]: <Step4 />
    }
  }, [setupData])

  const handleNext = () => {
    if (activeStep < StepsCount.fourth) {
      setActiveStep(prevStep => prevStep + 1)
    } else {
      handleSetupProcess()
    }
  }

  const handleSetupProcess = () => {
    saveSetupConfig({
      enabled: true,
      config: {
        exclusion_list: defaultTo(get(setupData, 'excludedInstances'), []).map(
          /* istanbul ignore next */ item => pick(item, ['instance_type', 'region'])
        ),
        savings_plans_config: {
          coverage: get(setupData, 'savingsPlanConfig.coverage', 0),
          term: get(setupData, 'savingsPlanConfig.term', 1),
          payments_strategy: get(setupData, 'savingsPlanConfig.payment', UpfrontPaymentMethods.No).toLowerCase()
        },
        reserved_instances_config: {
          coverage: get(setupData, 'riConfig.coverage', 0),
          term: get(setupData, 'riConfig.term', 1),
          payments_strategy: get(setupData, 'riConfig.payment', UpfrontPaymentMethods.No).toLowerCase()
        }
      }
    }).then(() => {
      history.push(routes.toCommitmentOrchestration({ accountId }))
    })
  }

  const isLastStep = activeStep === StepsCount.fourth

  return (
    <Container className={css.setupBody}>
      <SetupSteps activeStepCount={activeStep} />
      <SetupContext.Provider value={{ setupData, setSetupData }}>
        {stepCountToComponentMap[activeStep]}
      </SetupContext.Provider>
      <Layout.Vertical className={css.navigationCtaCont} spacing="large">
        {isLastStep && (
          <Checkbox
            label={getString('ce.commitmentOrchestration.setup.checkboxLabel')}
            checked={setupData?.isConfirm}
            onChange={e => setSetupData({ ...setupData, isConfirm: e.currentTarget.checked })}
          />
        )}
        <Layout.Horizontal spacing="medium">
          {activeStep !== StepsCount.first && (
            <Button
              variation={ButtonVariation.TERTIARY}
              icon="main-chevron-left"
              iconProps={{ size: 10 }}
              onClick={() => {
                setActiveStep(prevStep => prevStep - 1)
              }}
            >
              {getString('back')}
            </Button>
          )}
          <Button
            variation={ButtonVariation.PRIMARY}
            rightIcon="main-chevron-right"
            iconProps={{ size: 10 }}
            onClick={handleNext}
            disabled={isLastStep && !setupData?.isConfirm}
          >
            {isLastStep ? getString('confirm') : getString('continue')}
          </Button>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

export default SetupBody
