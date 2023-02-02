/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type {
  ServiceLevelIndicatorDTO,
  ServiceLevelIndicatorSpec,
  ThresholdSLIMetricSpec,
  RatioSLIMetricSpec,
  SLOTargetDTO,
  CalenderSLOTargetSpec,
  WeeklyCalendarSpec,
  NotificationRuleRefDTO
} from 'services/cv'
import type { SLOTargetChartWithAPIGetSliGraphProps } from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart.types'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { SLOV2Form, SLOV2FormFields } from '../../CVCreateSLOV2.types'

export interface SLIForm {
  [SLOV2FormFields.SLI_TYPE]: ServiceLevelIndicatorDTO['type']
  [SLOV2FormFields.SLI_METRIC_TYPE]?: ServiceLevelIndicatorSpec['type']
  [SLOV2FormFields.EVENT_TYPE]?: RatioSLIMetricSpec['eventType']
  [SLOV2FormFields.VALID_REQUEST_METRIC]: string
  [SLOV2FormFields.GOOD_REQUEST_METRIC]?: string
  [SLOV2FormFields.OBJECTIVE_VALUE]?: number
  [SLOV2FormFields.OBJECTIVE_COMPARATOR]?: ThresholdSLIMetricSpec['thresholdType']
  [SLOV2FormFields.SLI_MISSING_DATA_TYPE]: ServiceLevelIndicatorDTO['sliMissingDataType']
  [SLOV2FormFields.NAME]?: string
  [SLOV2FormFields.IDENTIFIER]?: string
  [SLOV2FormFields.HEALTH_SOURCE_REF]?: string
}

export interface SLOForm extends SLIForm {
  [SLOV2FormFields.NAME]: string
  [SLOV2FormFields.IDENTIFIER]: string
  [SLOV2FormFields.DESCRIPTION]?: string
  [SLOV2FormFields.TAGS]?: { [key: string]: string }
  [SLOV2FormFields.USER_JOURNEY_REF]: string
  [SLOV2FormFields.MONITORED_SERVICE_REF]: string
  [SLOV2FormFields.HEALTH_SOURCE_REF]: string
  [SLOV2FormFields.PERIOD_TYPE]?: SLOTargetDTO['type']
  [SLOV2FormFields.PERIOD_LENGTH]?: string
  [SLOV2FormFields.PERIOD_LENGTH_TYPE]?: CalenderSLOTargetSpec['type']
  [SLOV2FormFields.DAY_OF_MONTH]?: string
  [SLOV2FormFields.DAY_OF_WEEK]?: WeeklyCalendarSpec['dayOfWeek']
  [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: number
  [SLOV2FormFields.NOTIFICATION_RULE_REFS]: NotificationRuleRefDTO[]
}

export interface SLONameProps<T> {
  children?: JSX.Element
  formikProps: FormikProps<T>
  identifier?: string
  monitoredServicesLoading?: boolean
  monitoredServicesOptions?: SelectOption[]
  fetchingMonitoredServices?: () => void
  isMultiSelect?: boolean
}

export interface SLIProps
  extends Omit<SLOTargetChartWithAPIGetSliGraphProps, 'serviceLevelIndicator' | 'monitoredServiceIdentifier'> {
  formikProps: FormikProps<SLOV2Form>
}

export interface SLOTargetAndBudgetPolicyProps
  extends Omit<SLOTargetChartWithAPIGetSliGraphProps, 'serviceLevelIndicator' | 'monitoredServiceIdentifier'> {
  formikProps: FormikProps<SLOV2Form>
}
export interface ErrorBudgetInterface {
  periodType: SLOForm['periodType']
  periodLength: SLOForm['periodLength']
  periodLengthType: SLOForm['periodLengthType']
  SLOTargetPercentage: SLOForm['SLOTargetPercentage']
}

export enum CreateSimpleSLOSteps {
  Define_SLO_Identification = 'Define_SLO_Identification',
  Configure_Service_Level_Indicatiors = 'Configure_Service_Level_Indicatiors',
  Set_SLO = 'Set_SLO',
  Error_Budget_Policy = 'Error_Budget_Policy'
}
