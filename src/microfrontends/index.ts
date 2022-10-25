/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'

// component types
import type { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type RbacButton from '@rbac/components/Button/Button'
import type RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import type MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import type YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import type RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type LevelUpBanner from '@common/components/FeatureWarning/LevelUpBanner'

// hook types
import type { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { useTelemetry } from '@common/hooks/useTelemetry'
import type { useLogout } from 'framework/utils/SessionUtils'
import type useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { usePermission } from '@rbac/hooks/usePermission'
import type useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { useFeature } from '@common/hooks/useFeatures'

// parent context types
import type { AppStoreContext, AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import type { PermissionsContext, PermissionsContextProps } from 'framework/rbac/PermissionsContext'
import type { LicenseStoreContext, LicenseStoreContextProps } from 'framework/LicenseStore/LicenseStoreContext'
import type { TooltipContext } from 'framework/tooltip/TooltipContext'

// enums
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

// MFE prop types
import type { GitOpsCustomMicroFrontendProps } from '@cd/interfaces/GitOps.types'
import type { STOAppCustomProps } from '@pipeline/interfaces/STOApp'
import type { CCMUIAppCustomProps } from '@ce/interface/CCMUIApp.types'
import type { TIUIAppCustomProps } from '@pipeline/pages/execution/ExecutionTestView/interfaces/TIUIApp.types'
import type { ChaosCustomMicroFrontendProps } from '@chaos/interfaces/Chaos.types'
import type { FFCustomMicroFrontendProps } from '@cf/FFCustomMicroFrontendProps.types'

export interface Scope {
  accountId?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface CommonComponents {
  NGBreadcrumbs: typeof NGBreadcrumbs
  RbacButton: typeof RbacButton
  RbacMenuItem: typeof RbacMenuItem
  MonacoEditor: typeof MonacoEditor
  YAMLBuilder: typeof YAMLBuilder
  MonacoDiffEditor: typeof MonacoDiffEditor
  RBACTooltip?: typeof RBACTooltip
  LevelUpBanner?: typeof LevelUpBanner
}

export interface Hooks {
  useDocumentTitle: typeof useDocumentTitle
  useTelemetry?: typeof useTelemetry
  useLogout?: typeof useLogout
  useRBACError?: typeof useRBACError
  usePermission?: typeof usePermission
  useCreateConnectorModal?: typeof useCreateConnectorModal
  useFeature?: typeof useFeature
}

/**
 * Parent contexts which consists of all the context used in the parent app
 */
export interface ParentContext {
  appStoreContext: typeof AppStoreContext
  permissionsContext: typeof PermissionsContext
  licenseStoreProvider: typeof LicenseStoreContext
  tooltipContext?: typeof TooltipContext
}

export interface ChildAppProps {
  parentContextObj: ParentContext
  renderUrl: string
  matchPath: string
  scope: Scope
  components: CommonComponents
  hooks: Hooks
  on401?: () => void
  children?: React.ReactNode
}

/**
 * function to render child app inside the parent
 */
export type ChildAppComponent = React.ComponentType<ChildAppProps>

export {
  AppStoreContextProps,
  LicenseStoreContextProps,
  PermissionsContextProps,
  ResourceType,
  PermissionIdentifier,
  GitOpsCustomMicroFrontendProps,
  STOAppCustomProps,
  CCMUIAppCustomProps,
  TIUIAppCustomProps,
  ChaosCustomMicroFrontendProps,
  FFCustomMicroFrontendProps
}
