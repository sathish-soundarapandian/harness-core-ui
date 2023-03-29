/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Dispatch, SetStateAction } from 'react'
import type QueryString from 'qs'
import moment from 'moment'
import type Highcharts from 'highcharts'
import { Utils, SelectOption } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import { Color } from '@harness/design-system'
import { compact, filter, values, isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type {
  UserJourneyResponse,
  UserJourneyDTO,
  SLODashboardWidget,
  RiskCount,
  MonitoredServiceDTO,
  GetAllJourneysQueryParams,
  ResponsePageMSDropdownResponse,
  GetSLOHealthListViewQueryParams,
  ResponseSLORiskCountResponse
} from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import { DAYS, HOURS } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import {
  PAGE_SIZE_DASHBOARD_WIDGETS,
  LIST_USER_JOURNEYS_OFFSET,
  LIST_USER_JOURNEYS_PAGESIZE,
  SLOActionTypes
} from './CVSLOsListingPage.constants'
import {
  SLOCardToggleViews,
  GetSLOAndErrorBudgetGraphOptions,
  SLORiskFilter,
  RiskTypes,
  SLITypesParams,
  TargetTypesParams,
  SLOActionPayload,
  SLOFilterAction,
  SLOFilterState,
  SLOTargetChartWithChangeTimelineProps
} from './CVSLOsListingPage.types'
import { getMonitoredServicesOptions } from './common/SLI/SLI.utils'
import { getUserJourneyOptions } from './components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { EvaluationType } from './components/CVCreateSLOV2/CVCreateSLOV2.types'

export const getUserJourneys = (userJourneyResponse?: UserJourneyResponse[]): UserJourneyDTO[] => {
  return userJourneyResponse?.map(response => response.userJourney) ?? []
}

export const getSLORiskTypeFilter = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  riskTypes?: RiskCount[],
  totalCount?: number
): SLORiskFilter[] => {
  if (!riskTypes) {
    return []
  }

  const totalCountDetail = {
    displayName: getString('cv.slos.totalServices'),
    identifier: getString('all'),
    displayColor: Color.BLACK,
    count: totalCount
  }

  const riskTypesCardData = riskTypes.map(riskType => ({
    ...riskType,
    displayColor: getRiskColorValue(riskType.identifier as RiskTypes, false)
  }))
  return [totalCountDetail as SLORiskFilter, ...riskTypesCardData]
}

export const getErrorBudgetGaugeOptions = (serviceLevelObjective: SLODashboardWidget): Highcharts.Options => ({
  yAxis: {
    max: serviceLevelObjective.totalErrorBudget,
    tickPositions: [0, serviceLevelObjective.totalErrorBudget],
    minorTickLength: 0,
    tickLength: 0
  },
  series: [
    {
      type: 'solidgauge',
      data: [
        {
          y: serviceLevelObjective.errorBudgetRemaining,
          color: getRiskColorValue(serviceLevelObjective.errorBudgetRisk)
        }
      ],
      dataLabels: {
        formatter: function () {
          return `
            <div style="text-align:center">
              <span style="font-size:25px">
                ${Number(serviceLevelObjective.errorBudgetRemainingPercentage || 0).toFixed(2)}%
              </span>
            </div>
          `
        }
      }
    }
  ]
})

export const getDateUnitAndInterval = (
  serviceLevelObjective: SLODashboardWidget
): { unit: string; interval: number } => {
  const MILLISECONDS_PER_SIX_HOURS = 1000 * 60 * 60 * 6
  const timeline = serviceLevelObjective.currentPeriodLengthDays - serviceLevelObjective.timeRemainingDays

  /* istanbul ignore else */ if (timeline <= 1) {
    return { unit: 'Do MMM hh:mm A', interval: (MILLISECONDS_PER_SIX_HOURS * 4) / 3 }
  }

  /* istanbul ignore else */ if (timeline <= 3) {
    return { unit: 'Do MMM hh:mm A', interval: MILLISECONDS_PER_SIX_HOURS * timeline * 2 }
  }

  return { unit: 'Do MMM', interval: MILLISECONDS_PER_SIX_HOURS * timeline }
}

export const getPlotLines = (serviceLevelObjective: SLODashboardWidget): Highcharts.YAxisPlotLinesOptions[] => {
  const labelColor = Utils.getRealCSSColor(Color.PRIMARY_7)

  return [
    {
      value: Number((Number(serviceLevelObjective.sloTargetPercentage) || 0).toFixed(2)),
      color: Utils.getRealCSSColor(Color.PRIMARY_7),
      width: 2,
      zIndex: 4,
      label: {
        useHTML: true,
        formatter: function () {
          return `
          <div style="background-color:${labelColor};padding:4px 6px;border-radius:4px" >
            <span style="color:white">
              ${Number((Number(serviceLevelObjective.sloTargetPercentage) || 0).toFixed(2))}%
            </span>
          </div>
        `
        }
      }
    }
  ]
}

function downtimeTooltipFormatter(series: any): string {
  if (series?.point?.startTime) {
    return `
    <div style="padding: 8px; border-radius: 5px;">
    <div style="display: flex;">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.5" width="14" height="14" rx="8" fill="#7D4DD3" />
        <path
          d="M8.80147 6.64017C9.12659 5.68594 8.90309 4.58964 8.13098 3.8181C7.46049 3.14811 6.54619 2.8841 5.69287 3.04656C5.46937 3.0872 5.38816 3.37143 5.55058 3.53386L6.50552 4.48809C6.93227 4.91452 6.93227 5.58436 6.50552 6.01079C6.07877 6.43722 5.40843 6.43722 4.98168 6.01079L4.02674 5.05656C3.86418 4.89412 3.57974 4.97541 3.53907 5.19875C3.39678 6.05146 3.64069 6.98542 4.31119 7.63504C5.0833 8.40658 6.18043 8.60953 7.13537 8.30503L11.4834 12.6498C11.9507 13.1167 12.7025 13.1167 13.1495 12.6498C13.6168 12.1829 13.6168 11.4316 13.1495 10.9849L8.80147 6.64017Z"
          fill="white"
        />
      </svg>
      <p
        style="
          color: var(--grey-200);
          font-weight: 500;
          font-size: 11px;
          margin: 0 0 5px 10px;
        "
      >
        Downtime
      </p>
    </div>
    <p style="color: var(--grey-200); font-weight: 500; font-size: 10px; margin-bottom: 3px">
      ${moment(new Date(series?.point?.startTime)).format('ll')} ${moment(new Date(series?.point?.startTime)).format(
      'LT'
    )}
          - ${moment(new Date(series?.point?.endTime)).format('ll')}
           ${moment(new Date(series?.point?.endTime)).format('LT')}
    </p>
  </div>        
  `
  }
  return `
    <div style="padding: 8px; background-color: white">
      <p style="color: var(--grey-400); font-weight: 500; font-size: 10px">
        ${moment(new Date(series.x)).format('dddd, lll')}
      </p>
      <p style="font-size: 10px" >${series.y.toFixed(2)}%</p>
    </div>
  `
}

export const getSLOAndErrorBudgetGraphOptions = ({
  type,
  minXLimit,
  maxXLimit,
  serviceLevelObjective,
  startTime,
  endTime,
  isCardView
}: GetSLOAndErrorBudgetGraphOptions): Highcharts.Options => {
  const { unit, interval } = getDateUnitAndInterval(serviceLevelObjective)

  return {
    chart: { height: 200, spacing: [20, 0, 20, 0] },
    xAxis: {
      min: startTime,
      max: endTime,
      tickInterval: interval,
      tickWidth: isCardView ? 0 : 1,
      labels: {
        enabled: !isCardView,
        formatter: function () {
          return moment(new Date(this.value)).format(unit)
        }
      }
    },
    yAxis: {
      min: minXLimit,
      max: maxXLimit,
      plotLines: type === SLOCardToggleViews.SLO ? getPlotLines(serviceLevelObjective) : undefined
    },
    plotOptions: {
      area: {
        color: type === SLOCardToggleViews.ERROR_BUDGET ? Utils.getRealCSSColor(Color.RED_400) : undefined
      }
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      padding: 0,
      borderWidth: 0,
      outside: true,
      backgroundColor: 'var(--grey-700)',
      formatter: function (this) {
        return downtimeTooltipFormatter(this)
      }
    }
  }
}

const getAllOption = (getString: UseStringsReturn['getString']): SelectOption => {
  return { label: getString('all'), value: getString('all') }
}

export const getUserJourneyOptionsForFilter = (
  userJourneyData: UserJourneyResponse[] | undefined,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  return [getAllOption(getString), ...getUserJourneyOptions(userJourneyData)]
}

export const getMonitoredServicesOptionsForFilter = (
  monitoredServiceData: ResponsePageMSDropdownResponse | null,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  return [getAllOption(getString), ...getMonitoredServicesOptions(monitoredServiceData)]
}

export const getSliTypeOptionsForFilter = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    getAllOption(getString),
    {
      label: 'Availability',
      value: 'Availability'
    },
    {
      label: 'Latency',
      value: 'Latency'
    }
  ]
}

export const getEvaluationTypeOptionsForFilter = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    getAllOption(getString),
    {
      label: getString('cv.slos.slis.evaluationType.window'),
      value: EvaluationType.WINDOW
    },
    {
      label: getString('common.request'),
      value: EvaluationType.REQUEST
    }
  ]
}

export const getPeriodTypeOptionsForFilter = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    getAllOption(getString),
    {
      label: 'Rolling',
      value: 'Rolling'
    },
    {
      label: 'Calender',
      value: 'Calender'
    }
  ]
}

export function getFilterValueForSLODashboardParams(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  selectedValue: SelectOption
): string[] | undefined {
  if (selectedValue.value !== getString('all')) {
    return [selectedValue.value as string]
  }
}

export function getRiskFilterForSLODashboardParams(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  selectedValue: string | null
): string[] | undefined {
  if (selectedValue && selectedValue !== getString('all')) {
    return [selectedValue as string]
  }
}

export function getMonitoredServiceSLODashboardParams(
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  monitoredService: SelectOption
): string | undefined {
  return monitoredService.value !== getString('all') ? (monitoredService.value as string) : undefined
}

export function getIsSLODashboardAPIsLoading(
  userJourneysLoading: boolean,
  dashboardWidgetsLoading: boolean,
  deleteSLOLoading: boolean,
  monitoredServicesLoading: boolean,
  riskCountLoading: boolean
): boolean {
  return (
    userJourneysLoading || dashboardWidgetsLoading || deleteSLOLoading || monitoredServicesLoading || riskCountLoading
  )
}

type ErrorType = GetDataError<unknown> | null
// Sonar recommendation
export const getErrorObject = (
  dashboardWidgetsError: ErrorType,
  userJourneysError: ErrorType,
  dashboardRiskCountError: ErrorType,
  monitoredServicesDataError: ErrorType
): ErrorType => {
  return dashboardWidgetsError || userJourneysError || dashboardRiskCountError || monitoredServicesDataError
}

export const getIsDataEmpty = (contentLength?: number, riskCounts?: RiskCount[]): boolean => {
  return !contentLength && isRiskCountEmptyForEveryCategory(riskCounts)
}

export const getIsWidgetDataEmpty = (contentLength?: number, dashboardWidgetsLoading?: boolean): boolean => {
  return !contentLength && !dashboardWidgetsLoading
}

export const getIsSetPreviousPage = (pageIndex: number, pageItemCount: number): boolean => {
  return Boolean(pageIndex) && pageItemCount === 1
}

export function isRiskCountEmptyForEveryCategory(riskCounts?: RiskCount[]): boolean {
  return !!riskCounts?.every((el: RiskCount) => el.count === 0)
}

export function setFilterValue<T>(callback: Dispatch<SetStateAction<T>>, value: T): void {
  if (value) {
    callback(value)
  }
}

const defaultAllOption: SelectOption = { label: 'All', value: 'All' }

const getDefaultAllOption = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): SelectOption => ({ label: getString('all'), value: getString('all') })

export const initialState: SLOFilterState = {
  userJourney: defaultAllOption,
  monitoredService: defaultAllOption,
  sliTypes: defaultAllOption,
  targetTypes: defaultAllOption,
  sloRiskFilter: null,
  search: ''
}

const updateUserJourney = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.userJourney,
  payload
})
const updateMonitoredServices = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.monitoredService,
  payload
})
const updateSliType = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.sliTypes,
  payload
})
const updateTargetType = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.targetTypes,
  payload
})
const updateSloRiskType = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.sloRiskFilterAction,
  payload
})

const resetFilters = (): SLOFilterAction => ({
  type: SLOActionTypes.reset
})
const resetFiltersInMonitoredServicePageAction = (): SLOFilterAction => ({
  type: SLOActionTypes.resetFiltersInMonitoredServicePage
})

const updatedSearchAction = (payload: SLOActionPayload): SLOFilterAction => ({
  type: SLOActionTypes.search,
  payload
})

export const SLODashboardFilterActions = {
  updateUserJourney,
  updateMonitoredServices,
  updateSliType,
  updateTargetType,
  updateSloRiskType,
  resetFilters,
  resetFiltersInMonitoredServicePageAction,
  updatedSearchAction
}

export const sloFilterReducer = (state = initialState, data: SLOFilterAction): SLOFilterState => {
  const { payload = {} } = data

  switch (data.type) {
    case SLOActionTypes.userJourney:
      return {
        ...state,
        userJourney: payload.userJourney as SelectOption
      }
    case SLOActionTypes.monitoredService:
      return {
        ...state,
        monitoredService: payload.monitoredService as SelectOption
      }
    case SLOActionTypes.sliTypes:
      return {
        ...state,
        sliTypes: payload.sliTypes as SelectOption
      }
    case SLOActionTypes.targetTypes:
      return {
        ...state,
        targetTypes: payload.targetTypes as SelectOption
      }
    case SLOActionTypes.sloRiskFilterAction:
      return {
        ...state,
        sloRiskFilter: payload.sloRiskFilter as SLORiskFilter | null
      }
    case SLOActionTypes.reset:
      return initialState
    case SLOActionTypes.resetFiltersInMonitoredServicePage:
      return {
        ...initialState,
        monitoredService: state.monitoredService
      }

    case SLOActionTypes.search:
      return {
        ...initialState,
        search: payload.search as string
      }

    default:
      return initialState
  }
}

export const getInitialFilterState = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): SLOFilterState => {
  return {
    userJourney: getDefaultAllOption(getString),
    monitoredService: getDefaultAllOption(getString),
    sliTypes: getDefaultAllOption(getString),
    targetTypes: getDefaultAllOption(getString),
    sloRiskFilter: null,
    search: ''
  }
}

export const getInitialFilterStateLazy = (
  defaultInitialState: SLOFilterState,
  monitoredServiceData?: Pick<MonitoredServiceDTO, 'name' | 'identifier'>
): SLOFilterState => {
  if (!monitoredServiceData) {
    return defaultInitialState
  }

  return {
    ...defaultInitialState,
    monitoredService: {
      label: monitoredServiceData.name,
      value: monitoredServiceData.identifier
    }
  }
}

const getIsFiltersUnchanged = (
  filters: (string | number | symbol)[],
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): boolean => filters.every(value => value === getString('all'))

export const getIsClearFilterDisabled = (
  filterState: SLOFilterState,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): boolean => {
  const { monitoredService, sliTypes, sloRiskFilter, targetTypes, userJourney } = filterState

  return (
    getIsFiltersUnchanged([monitoredService.value, sliTypes.value, targetTypes.value, userJourney.value], getString) &&
    sloRiskFilter === null
  )
}

export const getIsMonitoresServicePageClearFilterDisabled = (
  filterState: SLOFilterState,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): boolean => {
  const { sliTypes, sloRiskFilter, targetTypes, userJourney } = filterState

  return (
    getIsFiltersUnchanged([sliTypes.value, targetTypes.value, userJourney.value], getString) && sloRiskFilter === null
  )
}

interface SLODashboardWidgetsParams {
  queryParams: GetSLOHealthListViewQueryParams
  queryParamStringifyOptions: QueryString.IStringifyOptions
}

interface PathParams {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

export const getSLODashboardWidgetsParams = (
  pathParams: PathParams,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  filterState: SLOFilterState,
  pageNumber?: number,
  monitoredServiceIdentifier?: string
): SLODashboardWidgetsParams => {
  const { monitoredService, search, sliTypes, sloRiskFilter, targetTypes, userJourney } = filterState
  return {
    queryParams: {
      ...pathParams,
      monitoredServiceIdentifier:
        monitoredServiceIdentifier || getMonitoredServiceSLODashboardParams(getString, monitoredService),
      pageNumber,
      pageSize: PAGE_SIZE_DASHBOARD_WIDGETS,
      userJourneyIdentifiers: getFilterValueForSLODashboardParams(getString, userJourney),
      targetTypes: getFilterValueForSLODashboardParams(getString, targetTypes) as TargetTypesParams[],
      sliTypes: getFilterValueForSLODashboardParams(getString, sliTypes) as SLITypesParams[],
      filter: search,
      errorBudgetRisks: getRiskFilterForSLODashboardParams(
        getString,
        sloRiskFilter?.identifier as string | null
      ) as RiskTypes[]
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  }
}

export const getServiceLevelObjectivesRiskCountParams = (
  pathParams: PathParams,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  filterState: SLOFilterState
): SLODashboardWidgetsParams => {
  const { monitoredService, search, sliTypes, targetTypes, userJourney } = filterState
  return {
    queryParams: {
      ...pathParams,
      monitoredServiceIdentifier: getMonitoredServiceSLODashboardParams(getString, monitoredService),
      userJourneyIdentifiers: getFilterValueForSLODashboardParams(getString, userJourney),
      targetTypes: getFilterValueForSLODashboardParams(getString, targetTypes) as TargetTypesParams[],
      sliTypes: getFilterValueForSLODashboardParams(getString, sliTypes) as SLITypesParams[],
      filter: search
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  }
}

export const getUserJourneyParams = (pathParams: PathParams): { queryParams: GetAllJourneysQueryParams } => {
  return {
    queryParams: {
      ...pathParams,
      offset: LIST_USER_JOURNEYS_OFFSET,
      pageSize: LIST_USER_JOURNEYS_PAGESIZE
    }
  }
}

export const getMonitoredServicesInitialState = (monitoredService: {
  name: string
  identifier: string
}): { monitoredService: SelectOption } => {
  return {
    monitoredService: {
      label: monitoredService.name,
      value: monitoredService.identifier
    }
  }
}

export const getClassNameForMonitoredServicePage = (className: string, isMonitoredServicePage?: string): string => {
  return isMonitoredServicePage ? className : ''
}

export const getTimeFormatForAnomaliesCard = (
  sliderTimeRange: SLOTargetChartWithChangeTimelineProps['sliderTimeRange']
): string => {
  const diff = moment(sliderTimeRange?.endTime).diff(moment(sliderTimeRange?.startTime), 'days')

  return diff < 2 ? HOURS : DAYS
}

export const getServiceTitle = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  monitoredServiceIdentifier = ''
) => (monitoredServiceIdentifier ? getString('cv.monitoredServices.title') : getString('cv.slos.title'))

export const isSLOFilterApplied = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  filterState: SLOFilterState
) =>
  getMonitoredServiceSLODashboardParams(getString, filterState.monitoredService) ||
  getFilterValueForSLODashboardParams(getString, filterState.userJourney) ||
  getFilterValueForSLODashboardParams(getString, filterState.targetTypes) ||
  getFilterValueForSLODashboardParams(getString, filterState.sliTypes)

export function getSLOsNoDataMessageTitle({
  monitoredServiceIdentifier,
  getString,
  riskCountResponse,
  filterState
}: {
  monitoredServiceIdentifier: string | undefined
  getString: UseStringsReturn['getString']
  riskCountResponse: ResponseSLORiskCountResponse | null
  filterState: SLOFilterState
}): string | undefined {
  if (monitoredServiceIdentifier) {
    return getString('cv.slos.noDataMS')
  } else {
    if (ifNoSLOsAreCreated(riskCountResponse, filterState)) {
      return getString('common.sloNoData')
    } else if (!isEmpty(filterState.search)) {
      return getString('cv.slos.noMatchingDataForSearch')
    } else {
      return getString('cv.slos.noMatchingData')
    }
  }
}

function ifNoSLOsAreCreated(riskCountResponse: ResponseSLORiskCountResponse | null, filterState: SLOFilterState) {
  return (
    !riskCountResponse?.data?.riskCounts ||
    (isEmpty(filter(compact(values(filterState)), ({ label }: SelectOption) => label !== 'All')) &&
      isEmpty(filterState.search))
  )
}
