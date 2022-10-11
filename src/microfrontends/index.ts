/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type ReactMonacoEditor from 'react-monaco-editor'
import type { MonacoDiffEditor } from 'react-monaco-editor'
import type { PermissionsContextProps } from 'framework/rbac/PermissionsContext'
import type { LicenseStoreContextProps } from 'framework/LicenseStore/LicenseStoreContext'
import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import type { UseLogoutReturn } from 'framework/utils/SessionUtils'
import type { NGBreadcrumbsProps } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ButtonProps } from '@rbac/components/Button/Button'
import type { RbacMenuItemProps } from '@rbac/components/MenuItem/MenuItem'
import type { RBACTooltipProps } from '@rbac/components/RBACTooltip/RBACTooltip'
import type { Title, UseDocumentTitleReturn } from '@common/hooks/useDocumentTitle'
import type { ExtendedMonacoEditorProps } from '@common/components/MonacoEditor/MonacoEditor'
import type { ExtendedMonacoDiffEditorProps } from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import type { PageParams, TelemetryReturnType } from '@common/hooks/useTelemetry'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { GitOpsCustomMicroFrontendProps } from '@cd/interfaces/GitOps.types'
import type { STOAppCustomProps } from '@pipeline/interfaces/STOApp'
import type { CCMUIAppCustomProps } from '@ce/interface/CCMUIApp.types'
import type { ChaosCustomMicroFrontendProps } from '@chaos/interfaces/Chaos.types'
import type { FFCustomMicroFrontendProps } from '@cf/FFCustomMicroFrontendProps.types'
import type { RbacErrorReturn } from '@rbac/utils/useRBACError/useRBACError'
import type {
  UseCreateConnectorModalReturn,
  UseCreateConnectorModalProps
} from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { LevelUpBannerProps } from '@common/components/FeatureWarning/LevelUpBanner'

export interface Scope {
  accountId?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface CommonComponents {
  NGBreadcrumbs: React.ComponentType<Partial<NGBreadcrumbsProps>>
  RbacButton: React.ComponentType<ButtonProps>
  RbacMenuItem: React.ComponentType<RbacMenuItemProps>
  MonacoEditor: React.ForwardRefExoticComponent<ExtendedMonacoEditorProps & React.RefAttributes<ReactMonacoEditor>>
  YAMLBuilder: React.FC<YamlBuilderProps>
  MonacoDiffEditor: React.ForwardRefExoticComponent<
    ExtendedMonacoDiffEditorProps & React.RefAttributes<MonacoDiffEditor>
  >
  RBACTooltip?: React.FC<RBACTooltipProps>
  LevelUpBanner?: React.FC<LevelUpBannerProps>
}

export interface Hooks {
  useDocumentTitle(title: Title, accountLevel?: boolean): UseDocumentTitleReturn
  useTelemetry?: (pageParams: PageParams) => TelemetryReturnType
  useLogout?: () => UseLogoutReturn
  useRBACError?: () => RbacErrorReturn
  usePermission?: (permissionsRequest?: PermissionsRequest, deps?: Array<any>) => Array<boolean>
  useCreateConnectorModal?: (props: UseCreateConnectorModalProps) => UseCreateConnectorModalReturn
}

/**
 * Parent contexts which consists of all the context used in the parent app
 */
export interface ParentContext {
  appStoreContext: React.Context<AppStoreContextProps>
  permissionsContext: React.Context<PermissionsContextProps>
  licenseStoreProvider: React.Context<LicenseStoreContextProps>
  tooltipContext?: React.Context<Record<string, any>>
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
  ChaosCustomMicroFrontendProps,
  FFCustomMicroFrontendProps
}
