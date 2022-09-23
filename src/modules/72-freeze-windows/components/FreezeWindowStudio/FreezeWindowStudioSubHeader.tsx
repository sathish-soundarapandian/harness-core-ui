/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import {
  Button,
  ButtonVariation,
  Container,
  Layout,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import { FreezeWindowStudioSubHeaderRightView } from './FreezeWindowStudioSubHeaderRightView'

interface WindowPathProps {
  windowIdentifier: string
}

interface FreezeWindowStudioSubHeaderProps {
  onViewChange(newView: SelectedView): boolean
}

export const FreezeWindowStudioSubHeader: React.FC<FreezeWindowStudioSubHeaderProps> = ({ onViewChange }) => {
  const { accountId, projectIdentifier, orgIdentifier, module, windowIdentifier } = useParams<
    ProjectPathProps & ModulePathParams & WindowPathProps
  >()
  const history = useHistory()
  const { view } = React.useContext(FreezeWindowContext)
  const isYaml = view === SelectedView.YAML
  const isVisualViewDisabled = false
  const navigateToFreezeWindlows = React.useCallback(() => {
    history.push(routes.toFreezeWindows({ orgIdentifier, projectIdentifier, accountId, module }))
  }, [history, routes.toFreezeWindows, orgIdentifier, projectIdentifier, accountId, module])

  const [showConfigModal, hideConfigModal] = useModalHook(() => {
    const onCloseCreate = () => {
      if (windowIdentifier === '-1') {
        navigateToFreezeWindlows()
      }

      hideConfigModal()
    }

    return (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        // className={classNames(css.createTemplateDialog, {
        //   [css.gitCreateTemplateDialog]: supportingTemplatesGitx
        // })}
      >
        <Button
          // className={css.closeIcon}
          // iconProps={{ size: 24, color: Color.GREY_500 }}
          icon="cross"
          variation={ButtonVariation.ICON}
          onClick={onCloseCreate}
        />
        {/*{modalProps && <TemplateConfigModalWithRef {...modalProps} onClose={onCloseCreate} />}*/}
      </Dialog>
    )
  }, [windowIdentifier])

  React.useEffect(() => {
    if (windowIdentifier === '-1') {
      hideConfigModal()
      // showConfigModal()
    }
  }, [windowIdentifier, showConfigModal]) // windowIdentifier

  return (
    <Container
      height={49}
      padding={{ right: 'xlarge', left: 'xlarge' }}
      border={{ bottom: true, color: Color.GREY_200 }}
      background={Color.WHITE}
    >
      <Layout.Horizontal height={'100%'} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div>1</div>
        <Container>
          <VisualYamlToggle
            // className={css.visualYamlToggle}
            selectedView={isYaml || isVisualViewDisabled ? SelectedView.YAML : SelectedView.VISUAL}
            onChange={nextMode => {
              onViewChange(nextMode)
            }}
            disableToggle={isVisualViewDisabled}
          />
        </Container>
        <FreezeWindowStudioSubHeaderRightView />
      </Layout.Horizontal>
    </Container>
  )
}
