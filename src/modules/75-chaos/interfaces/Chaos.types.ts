/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { Diagnostic } from 'vscode-languageserver-types'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { OverviewChartsWithToggleProps } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import type { SchedulePanelPropsInterface } from '@common/components/SchedulePanel/SchedulePanel'
import type { NavigationCheckProps } from '@common/components/NavigationCheck/NavigationCheck'
import type { DurationProps } from '@common/exports'
import type { FormikUserGroupsInput } from '@rbac/components/UserGroupsInput/UserGroupsInput'
import type { ScheduleFreezeFormProps } from '@freeze-windows/components/ScheduleFreezeForm/ScheduleFreezeForm'

export interface ChaosCustomMicroFrontendProps {
  customComponents?: {
    ConnectorReferenceField?: React.ComponentType<ConnectorReferenceFieldProps>
    OverviewChartsWithToggle?: React.ComponentType<OverviewChartsWithToggleProps>
    Duration?: React.ComponentType<DurationProps>
    NavigationCheck?: React.ComponentType<NavigationCheckProps>
    SchedulePanel?: React.ComponentType<SchedulePanelPropsInterface>
    UserGroupsInput?: React.ComponentType<FormikUserGroupsInput>
    ScheduleFreezeForm?: React.ComponentType<ScheduleFreezeFormProps>
  }
  customFunctions?: {
    validateYAMLWithSchema?: (yamlString: string, schema: Record<string, any>) => Promise<Diagnostic[]>
  }
}

export interface SelectPipelineExperimentProps {
  selectedExperimentID: string
  onSelect: (experimentID: string) => void
  goToNewExperiment: () => void
  goToChaosExperiment: (indentifier: string) => void
}

export interface ExperimentPreviewProps {
  experimentID: string
}

export interface ChaosStepExecutionProps {
  notifyID: string
  status: string
  expectedResilienceScore: number
  isManualInterruption: boolean
  actionButtons: React.ReactElement
  onViewExecutionClick: (expRunIdentifier: string) => void
}
