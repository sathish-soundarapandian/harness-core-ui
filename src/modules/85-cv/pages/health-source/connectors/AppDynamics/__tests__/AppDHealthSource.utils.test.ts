/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as uuid from 'uuid'
import {
  initializeCreatedMetrics,
  initializeSelectedMetricsMap
} from '@cv/pages/health-source/common/CustomMetric/CustomMetric.utils'
import {
  FailFastActionValues,
  IgnoreThresholdType
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.constants'
import {
  validateMapping,
  createAppDFormData,
  getBaseAndMetricPath,
  createAppDynamicsPayload,
  initializeNonCustomFields,
  convertMetricPackToMetricData,
  convertStringMetricPathToObject,
  convertStringBasePathToObject,
  convertFullPathToBaseAndMetric,
  initAppDCustomFormValue
} from '../AppDHealthSource.utils'
import {
  appDMetricValue,
  expectedAppDynamicData,
  expectedThresholdsInitialData,
  formData,
  formDataExpectedOutput,
  formikInitialData,
  nonCustomFeilds,
  payloadWithThreshold,
  validateMappingNoError,
  validateMappingWithErrors,
  validateMappingWithMetricPathError
} from './AppDMonitoredSource.mock'
import { PATHTYPE } from '../Components/AppDCustomMetricForm/AppDCustomMetricForm.constants'
import { ThresholdTypes } from '../AppDHealthSource.constants'
import { CriteriaValues } from '../Components/AppDMetricThreshold/AppDMetricThresholdConstants'

jest.mock('uuid')
describe('Test Util funcitons', () => {
  test('should validate validateMapping No Error', () => {
    expect(
      validateMapping({
        values: validateMappingNoError,
        createdMetrics: ['appdMetric Two', 'appdMetric One Updated'],
        selectedMetricIndex: 0,
        getString: val => val,
        isMetricThresholdEnabled: false
      })
    ).toEqual({})
  })
  test('should validate validateMapping All Errors', () => {
    expect(
      validateMapping({
        values: validateMappingWithErrors,
        createdMetrics: ['appdMetric Two', 'appdMetric One Updated'],
        selectedMetricIndex: 0,
        getString: val => val,
        isMetricThresholdEnabled: false
      })
    ).toEqual({
      appDTier: 'cv.healthSource.connectors.AppDynamics.validation.tier',
      appdApplication: 'cv.healthSource.connectors.AppDynamics.validation.application',
      basePath: 'cv.healthSource.connectors.AppDynamics.validation.basePath',
      lowerBaselineDeviation: 'cv.monitoringSources.prometheus.validation.deviation',
      metricName: 'cv.monitoringSources.metricNameValidation',
      metricPath: 'cv.healthSource.connectors.AppDynamics.validation.metricPath',
      riskCategory: 'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory',
      metricIdentifier: 'cv.monitoringSources.prometheus.validation.metricIdentifierUnique',
      continuousVerification: 'cv.healthSource.connectors.AppDynamics.validation.missingServiceInstanceMetricPath'
    })
    expect(
      validateMapping({
        values: validateMappingWithMetricPathError,
        createdMetrics: ['appdMetric Two', 'appdMetric One Updated'],
        selectedMetricIndex: 0,
        getString: val => val,
        isMetricThresholdEnabled: false
      })
    ).toEqual({ metricPath: 'cv.healthSource.connectors.AppDynamics.validation.metricPathWithoutLeafNode' })

    const fullPathMissingTierInfo = Object.assign({}, validateMappingNoError) as any
    fullPathMissingTierInfo['pathType'] = PATHTYPE.FullPath
    fullPathMissingTierInfo['fullPath'] = 'Overall Application Performance | docker-tier | Calls per Minute'
    expect(
      validateMapping({
        values: fullPathMissingTierInfo,
        createdMetrics: ['appdMetric Two', 'appdMetric One Updated'],
        selectedMetricIndex: 0,
        getString: val => val,
        isMetricThresholdEnabled: false
      })
    ).toEqual({ fullPath: 'cv.healthSource.connectors.AppDynamics.validation.missingTierInFullPath' })
  })

  test('thresholds validation errors', () => {
    const fullPathMissingTierInfo = Object.assign({}, validateMappingNoError) as any
    fullPathMissingTierInfo['pathType'] = PATHTYPE.FullPath
    fullPathMissingTierInfo['fullPath'] = 'Overall Application Performance | docker-tier | Calls per Minute'
    fullPathMissingTierInfo.ignoreThresholds = [
      {
        metricType: undefined,
        groupName: undefined,
        metricName: undefined,
        type: ThresholdTypes.IgnoreThreshold,
        spec: {
          action: IgnoreThresholdType
        },
        criteria: {
          type: CriteriaValues.Absolute,
          spec: {}
        }
      }
    ]
    fullPathMissingTierInfo.failFastThresholds = [
      {
        metricType: undefined,
        groupName: undefined,
        metricName: undefined,
        type: ThresholdTypes.FailImmediately,
        spec: {
          action: FailFastActionValues.FailImmediately,
          spec: {}
        },
        criteria: {
          type: CriteriaValues.Absolute,
          spec: {}
        }
      }
    ]
    expect(
      validateMapping({
        values: fullPathMissingTierInfo,
        createdMetrics: ['appdMetric Two', 'appdMetric One Updated'],
        selectedMetricIndex: 0,
        getString: val => val,
        isMetricThresholdEnabled: true
      })
    ).toEqual({
      'failFastThresholds.0.criteria.spec.greaterThan': 'cv.required',
      'failFastThresholds.0.criteria.spec.lessThan': 'cv.required',
      'failFastThresholds.0.groupName': 'cv.metricThresholds.validations.groupTransaction',
      'failFastThresholds.0.metricName': 'cv.metricThresholds.validations.metricName',
      'failFastThresholds.0.metricType': 'cv.metricThresholds.validations.metricType',
      fullPath: 'cv.healthSource.connectors.AppDynamics.validation.missingTierInFullPath',
      'ignoreThresholds.0.criteria.spec.greaterThan': 'cv.required',
      'ignoreThresholds.0.criteria.spec.lessThan': 'cv.required',
      'ignoreThresholds.0.groupName': 'cv.metricThresholds.validations.groupTransaction',
      'ignoreThresholds.0.metricName': 'cv.metricThresholds.validations.metricName',
      'ignoreThresholds.0.metricType': 'cv.metricThresholds.validations.metricType'
    })
  })

  test('should validate createAppDynamicsPayload', () => {
    jest.spyOn(uuid, 'v4').mockReturnValue('MockedUUID')
    expect(createAppDynamicsPayload(formData, false)).toEqual(formDataExpectedOutput)
  })

  test('should validate createAppDynamicsPayload with thresholds', () => {
    jest.spyOn(uuid, 'v4').mockReturnValue('MockedUUID')
    expect(createAppDynamicsPayload(formData, true)).toEqual(payloadWithThreshold)
  })

  test('should validate createAppDynamicsPayload ifOnlySliIsSelected and no metricPack selected', () => {
    jest.spyOn(uuid, 'v4').mockReturnValue('MockedUUID')
    // set SLI true and no MetricData as non selected
    formData.sli = true
    formData.continuousVerification = false
    formData.healthScore = false
    formData.metricData = { Performance: false, Errors: false }
    const mappedValue = formData.mappedServicesAndEnvs.get(formData.metricName)
    mappedValue.sli = true
    mappedValue.continuousVerification = false
    mappedValue.healthScore = false
    mappedValue.metricData = { Performance: false, Errors: false }
    formData.mappedServicesAndEnvs.set(formData.metricName, mappedValue)
    // set riskProfile to undefined
    formDataExpectedOutput.spec.metricPacks = []
    formDataExpectedOutput.spec.metricData.Errors = false
    formDataExpectedOutput.spec.metricData.Performance = false
    formDataExpectedOutput.spec.metricDefinitions[1].sli = { enabled: true }
    formDataExpectedOutput.spec.metricDefinitions[1].analysis.deploymentVerification = {
      enabled: false,
      serviceInstanceMetricPath: undefined
    }
    formDataExpectedOutput.spec.metricDefinitions[1].analysis.riskProfile = {} as any
    expect(createAppDynamicsPayload(formData, false)).toEqual(formDataExpectedOutput)

    // Metrick packs are not selected
    validateMappingNoError.metricData = { Performance: false, Errors: true }
    validateMappingNoError.sli = true
    validateMappingNoError.continuousVerification = false
    validateMappingNoError.healthScore = false
    expect(
      validateMapping({
        values: validateMappingNoError,
        createdMetrics: ['appdMetric Two', 'appdMetric One Updated'],
        selectedMetricIndex: 0,
        getString: val => val,
        isMetricThresholdEnabled: false
      })
    ).toEqual({})
  })

  test('should check initializeNonCustomFields for metric thresholds', () => {
    expect(initializeNonCustomFields(expectedAppDynamicData as any, true)).toEqual(expectedThresholdsInitialData)
  })

  test('should validate createAppDFormData', () => {
    const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
      'defaultAppDMetricName',
      initAppDCustomFormValue(),
      expectedAppDynamicData?.mappedServicesAndEnvs
    )
    const mappedServicesAndEnvs = new Map()
    mappedServicesAndEnvs.set('appdMetric', appDMetricValue)
    expect(selectedMetric).toEqual('appdMetric')
    expect(mappedMetrics).toEqual(mappedServicesAndEnvs)

    const { createdMetrics, selectedMetricIndex } = initializeCreatedMetrics(
      'defaultAppDMetricName',
      selectedMetric,
      mappedMetrics
    )

    expect(createdMetrics).toEqual(['appdMetric'])
    expect(selectedMetricIndex).toEqual(0)

    expect(
      createAppDFormData(expectedAppDynamicData as any, mappedMetrics, selectedMetric, nonCustomFeilds, true)
    ).toEqual(formikInitialData)
  })

  test('should validate convertMetricPackToMetricData', () => {
    expect(convertMetricPackToMetricData([{ identifier: 'Performance' }, { identifier: 'Errors' }])).toEqual({
      Errors: true,
      Performance: true
    })
  })

  test('should validate convertStringBasePathTo and convertStringMetricPathTo', () => {
    expect(convertStringBasePathToObject('Application Infrastructure Performance|cvng')).toEqual({
      basePathDropdown_0: {
        path: '',
        value: 'Application Infrastructure Performance'
      },
      basePathDropdown_1: {
        path: 'Application Infrastructure Performance',
        value: 'cvng'
      },
      basePathDropdown_2: {
        path: 'Application Infrastructure Performance|cvng',
        value: ''
      }
    })

    expect(convertStringMetricPathToObject('performance|call per minute')).toEqual({
      metricPathDropdown_0: {
        path: '',
        isMetric: false,
        value: 'performance'
      },
      metricPathDropdown_1: {
        path: 'performance',
        isMetric: true,
        value: 'call per minute'
      },
      metricPathDropdown_2: {
        isMetric: false,
        path: 'performance|call per minute',
        value: ''
      }
    })
  })

  test('should validate convertFullPathToBaseAndMetric', () => {
    expect(
      convertFullPathToBaseAndMetric('Overall Application Performance | manager | Exceptions per Minute', 'manager')
    ).toEqual({ derivedBasePath: 'Overall Application Performance', derivedMetricPath: 'Exceptions per Minute' })
  })

  test('should validate getBaseAndMetricPath', () => {
    const basePath = {
      basePathDropdown_0: { path: '', value: 'Overall Application Performance' },
      basePathDropdown_1: { path: 'Overall Application Performance', value: '' }
    }
    const metricPath = {
      metricPathDropdown_0: { value: 'Exceptions per Minute', path: '', isMetric: true },
      metricPathDropdown_1: { value: '', path: 'Exceptions per Minute', isMetric: false }
    }
    expect(
      getBaseAndMetricPath(
        basePath,
        metricPath,
        'Overall Application Performance | manager | Exceptions per Minute',
        'manager'
      )
    ).toEqual({ derivedBasePath: 'Overall Application Performance', derivedMetricPath: 'Exceptions per Minute' })

    expect(getBaseAndMetricPath(basePath, metricPath, null, 'manager')).toEqual({
      derivedBasePath: 'Overall Application Performance',
      derivedMetricPath: 'Exceptions per Minute'
    })
  })
})
