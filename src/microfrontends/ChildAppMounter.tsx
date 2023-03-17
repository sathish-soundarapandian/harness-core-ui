/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ComponentType, LazyExoticComponent, ReactElement } from 'react'
import { useLogout } from 'framework/utils/SessionUtils'
import RbacButton from '@rbac/components/Button/Button'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useFeature } from '@common/hooks/useFeatures'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { usePermission } from '@rbac/hooks/usePermission'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import LevelUpBanner from '@common/components/FeatureWarning/LevelUpBanner'
import ParentLink from '@common/components/ParentLink/ParentLink'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import { useEventSourceListener } from '@common/hooks/useEventSourceListener'
import ChildComponentMounter, { ChildComponentMounterProps } from './ChildComponentMounter'
import type { ChildAppProps } from './index'

export { ChildAppProps }

interface ChildAppMounterProps extends Omit<ChildComponentMounterProps, 'ChildComponent'> {
  ChildApp: LazyExoticComponent<ComponentType<ChildAppProps>>
}

function ChildAppMounter<T>({ ChildApp, children, ...rest }: T & ChildAppMounterProps): ReactElement {
  return (
    <ChildComponentMounter<Pick<ChildAppProps, 'components' | 'hooks' | 'utils'>>
      ChildComponent={ChildApp as ChildComponentMounterProps['ChildComponent']}
      {...rest}
      components={{
        RbacButton,
        RbacMenuItem,
        RBACTooltip,
        NGBreadcrumbs,
        MonacoEditor,
        YAMLBuilder,
        MonacoDiffEditor,
        LevelUpBanner,
        ParentLink
      }}
      hooks={{
        useDocumentTitle,
        useTelemetry,
        useLogout,
        useRBACError,
        usePermission,
        useCreateConnectorModal,
        useFeature,
        useEventSourceListener
      }}
      utils={{ getLocationPathName }}
    >
      {children}
    </ChildComponentMounter>
  )
}

export default ChildAppMounter
