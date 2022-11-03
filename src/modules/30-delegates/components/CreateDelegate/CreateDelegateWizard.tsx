/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useStrings } from 'framework/strings'
import { DelegateTypes } from '@delegates/constants'
import CreateK8sDelegate from '@delegates/components/CreateDelegate/K8sDelegate/CreateK8sDelegate'
import CreateDockerDelegate from '@delegates/components/CreateDelegate/DockerDelegate/CreateDockerDelegate'
import DelegateSelectStep, {
  CardData
} from '@delegates/components/CreateDelegate/DelegateSelectStep/DelegateSelectStep'

interface DelegateWizardProps {
  type: string
  onBack: any
  onClose?: any
}

interface CreateDelegateWizardProps {
  onClose?: any
}

export const DelegateWizard: React.FC<DelegateWizardProps> = props => {
  const { type, onBack } = props
  switch (type) {
    case DelegateTypes.KUBERNETES_CLUSTER:
      return <CreateK8sDelegate onBack={onBack} onClose={props.onClose} />
    case DelegateTypes.DOCKER:
      return <CreateDockerDelegate onBack={onBack} onClose={props.onClose} />
    default:
      /* istanbul ignore next */
      return null
  }
}

export const CreateDelegateWizard: React.FC<CreateDelegateWizardProps> = props => {
  const { getString } = useStrings()
  const [showWizard, setShowWizard] = React.useState(false)
  const [delType, setDelType] = React.useState(DelegateTypes.KUBERNETES_CLUSTER)
  return (
    <div>
      {!showWizard && (
        <DelegateSelectStep
          type={delType}
          name={getString('delegate.stepOneWizard')}
          onClick={(selectedCard: CardData) => {
            setDelType(selectedCard?.type)
            setShowWizard(true)
          }}
        />
      )}
      {showWizard && (
        <DelegateWizard
          {...props}
          type={delType}
          onBack={() => {
            setShowWizard(false)
          }}
        />
      )}
    </div>
  )
}
