import React from 'react'

import { Button, Dialog } from '@harness/uicore'
import { Drawer, Position } from '@blueprintjs/core'
import DelegateCommandLineCreation from '@delegates/pages/delegates/delegateCommandLineCreation/DelegateCommandLineCreation'
import type { DelegateCommandLineTypes, DelegateDefaultName } from '@delegates/constants'
import css from './CDOnboardingWizardWithCLI.module.scss'
export interface DelgateDetails {
  delegateName?: DelegateDefaultName
  delegateType?: DelegateCommandLineTypes
}
export interface useCreateDelegateViaCommandsModalProps {
  oldDelegateCreation?: () => void
  hideDocker?: boolean
  onClose: (data: DelgateDetails) => void
  isOpen?: boolean
}

export default function DelegateModal(props: useCreateDelegateViaCommandsModalProps): JSX.Element {
  const [delgateDetails, setDelegateDetails] = React.useState<DelgateDetails>({})
  const onClose = (): void => {
    props.onClose(delgateDetails)
  }
  const onDelegateConfigChange = (data: DelgateDetails): void => {
    setDelegateDetails(data)
  }
  return (
    <Dialog enforceFocus={false} isOpen={Boolean(props.isOpen)}>
      <Drawer position={Position.RIGHT} isOpen={true} isCloseButtonShown={true} size={'86%'}>
        <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={onClose} />

        <DelegateCommandLineCreation
          onDone={onClose}
          hideDocker={props?.hideDocker}
          oldDelegateCreation={props?.oldDelegateCreation}
          onDelegateConfigChange={onDelegateConfigChange}
        />
      </Drawer>
    </Dialog>
  )
}
