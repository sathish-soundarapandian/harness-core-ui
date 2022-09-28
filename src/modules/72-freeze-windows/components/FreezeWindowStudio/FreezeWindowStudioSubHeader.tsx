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
  Container,
  Layout,
  Text,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import { DefaultFreezeId } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowReducer'
import { FreezeWindowStudioSubHeaderRightView } from './FreezeWindowStudioSubHeaderRightView'
import { CreateNewFreezeWindow } from './CreateNewFreezeWindow'

interface WindowPathProps {
  freezeIdentifier: string
}

interface FreezeWindowStudioSubHeaderProps {
  onViewChange(newView: SelectedView): boolean
}

export const FreezeWindowStudioSubHeader: React.FC<FreezeWindowStudioSubHeaderProps> = ({ onViewChange }) => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<
    ProjectPathProps & ModulePathParams & WindowPathProps
  >()
  const { getString } = useStrings()
  const {
    state: { freezeObj },
    updateFreeze
  } = React.useContext(FreezeWindowContext)
  const freezeIdentifier = freezeObj.identifier
  const history = useHistory()
  const { view } = React.useContext(FreezeWindowContext)
  const isYaml = view === SelectedView.YAML
  const isVisualViewDisabled = false
  const navigateToFreezeWindlows = React.useCallback(() => {
    history.push(routes.toFreezeWindows({ orgIdentifier, projectIdentifier, accountId, module }))
  }, [history, routes.toFreezeWindows, orgIdentifier, projectIdentifier, accountId, module])

  const [showConfigModal, hideConfigModal] = useModalHook(() => {
    const onCloseCreate = (identifier = freezeIdentifier) => {
      if (identifier === DefaultFreezeId) {
        navigateToFreezeWindlows()
      }

      hideConfigModal()
    }

    // const onClose = React.useCallback(() => onCloseCreate(), [])

    return (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        // className={classNames(css.createTemplateDialog, {
        //   [css.gitCreateTemplateDialog]: supportingTemplatesGitx
        // })}
        onClose={() => onCloseCreate()}
        title={
          <Container padding={{ left: 'xlarge', top: 'xlarge' }}>
            <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
              {getString('freezeWindows.freezeWindowsPage.newFreezeWindow')}
            </Text>
          </Container>
        }
      >
        <CreateNewFreezeWindow onClose={onCloseCreate} updateFreeze={updateFreeze} />
      </Dialog>
    )
  }, [freezeIdentifier])

  React.useEffect(() => {
    if (freezeIdentifier === DefaultFreezeId) {
      hideConfigModal()
      showConfigModal()
    }
  }, [freezeIdentifier, showConfigModal]) // freezeIdentifier

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
