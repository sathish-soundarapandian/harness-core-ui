/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  createCardOptions,
  validateChangeSource,
  getChangeSourceOptions,
  buildInitialData
} from '../ChangeSourceDrawer.utils'
import { allFieldsEmpty, emptyPagerDutyConnectorAndService } from './ChangeSourceDrawer.mock'
import { ChangeSourceCategoryName } from '../ChangeSourceDrawer.constants'

function mockGetString(name: string): string {
  switch (name) {
    case 'cv.onboarding.changeSourceTypes.HarnessCDNextGen.name':
      return 'Harness CD NextGen'
    case 'kubernetesText':
      return 'Kubernetes'
    case 'common.pagerDuty':
      return 'PagerDuty'
    case 'cv.changeSource.duplicateIdentifier':
      return 'identifier already exist'
    case 'cv.changeSource.selectChangeSourceName':
      return 'Select change source name'
    case 'cv.changeSource.selectChangeSourceProvider':
      return 'Select change source provider'
    case 'cv.changeSource.selectChangeSourceType':
      return 'Select change source type'
    case 'cv.onboarding.selectProductScreen.validationText.connectorRef':
      return 'Connector Selection is required'
    default:
      return ''
  }
}
describe('Validate ChangeSource Utils', () => {
  test('Validate CreateCardOptions', () => {
    expect(createCardOptions('Deployment', mockGetString, true)).toEqual([
      {
        category: 'Deployment',
        icon: 'cd-main',
        label: 'Harness CD NextGen',
        value: 'HarnessCDNextGen'
      },
      {
        category: 'Deployment',
        icon: 'harness',
        label: '',
        value: 'HarnessCD'
      },
      {
        category: 'Deployment',
        icon: 'service-custom-connector',
        label: '',
        value: 'CustomDeploy'
      }
    ])
    expect(createCardOptions('Infrastructure', mockGetString, true)).toEqual([
      { category: 'Infrastructure', icon: 'app-kubernetes', label: 'Kubernetes', value: 'K8sCluster' },
      { category: 'Infrastructure', icon: 'service-custom-connector', label: '', value: 'CustomInfrastructure' }
    ])
    expect(createCardOptions('Alert', mockGetString, true)).toEqual([
      { category: 'Alert', icon: 'service-pagerduty', label: 'PagerDuty', value: 'PagerDuty' },
      { category: 'Alert', icon: 'service-custom-connector', label: '', value: 'CustomIncident' }
    ])
  })

  test('ValidateChangeSource', () => {
    // None of the fields are populated
    expect(validateChangeSource({ spec: {} }, [], false, mockGetString)).toEqual(allFieldsEmpty)
    // Validate HarnessCD having no empty fields
    expect(
      validateChangeSource(
        { name: 'HarnessCD', type: 'HarnessCD', category: 'Deployment', spec: {} },
        [],
        false,
        mockGetString
      )
    ).toEqual({
      spec: {
        harnessApplicationId: '',
        harnessEnvironmentId: '',
        harnessServiceId: ''
      }
    })
    // Validate PagerDuty having empty Connector and PagerDuty Service
    expect(
      validateChangeSource(
        { name: 'pagerduty', type: 'PagerDuty', category: 'Alert', spec: {} },
        [],
        false,
        mockGetString
      )
    ).toEqual(emptyPagerDutyConnectorAndService)
  })

  test('Ensure getChangeSourceOptions works as intended', async () => {
    // no infra options should be returned for application type
    expect(getChangeSourceOptions(jest.fn(), 'Application', true)).toEqual([
      {
        label: undefined,
        value: 'Deployment'
      },
      {
        label: undefined,
        value: 'Alert'
      },
      {
        label: undefined,
        value: 'FeatureFlag'
      }
    ])

    // no deployment options should be return for infra type
    expect(getChangeSourceOptions(jest.fn(), 'Infrastructure', true)).toEqual([
      {
        label: undefined,
        value: 'Infrastructure'
      },
      {
        label: undefined,
        value: 'Alert'
      },
      {
        label: undefined,
        value: 'FeatureFlag'
      }
    ])

    expect(getChangeSourceOptions(jest.fn())).toEqual([
      {
        label: undefined,
        value: 'Deployment'
      },
      {
        label: undefined,
        value: 'Infrastructure'
      },
      {
        label: undefined,
        value: 'Alert'
      },
      {
        label: undefined,
        value: 'FeatureFlag'
      }
    ])
  })

  test('Ensure building initial data returns correct values', async () => {
    expect(
      buildInitialData([
        { label: 'deploymentText', value: ChangeSourceCategoryName.DEPLOYMENT },
        { label: 'cv.changeSource.tooltip.incidents', value: ChangeSourceCategoryName.ALERT }
      ])
    ).toEqual({
      category: 'Deployment',
      enabled: true,
      spec: {},
      type: ''
    })

    expect(
      buildInitialData([
        { label: 'infrastructureText', value: ChangeSourceCategoryName.INFRASTRUCTURE },
        { label: 'cv.changeSource.tooltip.incidents', value: ChangeSourceCategoryName.ALERT }
      ])
    ).toEqual({
      category: 'Infrastructure',
      enabled: true,
      spec: {},
      type: 'K8sCluster'
    })
  })
})
