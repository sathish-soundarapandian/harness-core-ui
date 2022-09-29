import React from 'react'
import ArtifactConditionsPanel from '@triggers/components/steps/ArtifactTriggerConditionsPanel/ArtifactConditionsPanel'
import ArtifactTriggerInputPanel from '@triggers/components/steps/ArtifactTriggerInputPanel/ArtifactTriggerInputPanel'
import ArtifactTriggerConfigPanel from '@triggers/components/steps/ArtifactTriggerConfigPanel/ArtifactTriggerConfigPanel'
import { Trigger, TriggerProps } from '../Trigger'
import { TriggerBaseType } from '../TriggerInterface'
import ArtifactTriggerWizard from './ArtifactTriggerWizard'

export abstract class ArtifactTrigger<T> extends Trigger<T> {
  protected baseType: TriggerBaseType = TriggerBaseType.ARTIFACT

  renderStepOne(): JSX.Element {
    return <ArtifactTriggerConfigPanel />
  }

  renderStepTwo(): JSX.Element {
    return <ArtifactConditionsPanel />
  }

  renderStepThree(): JSX.Element {
    return <ArtifactTriggerInputPanel />
  }

  renderTrigger(props: TriggerProps<T>): JSX.Element {
    return (
      <ArtifactTriggerWizard {...props}>
        {this.renderStepOne()}
        {this.renderStepTwo()}
        {this.renderStepThree()}
      </ArtifactTriggerWizard>
    )
  }
}
