/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  awsRegionsCall,
  awsRegionsResponse,
  awsWorkspacesCall,
  awsConnectorCall,
  featureFlagsCall,
  workspaceMock
} from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  riskCategoryMock
} from '../../../support/85-cv/monitoredService/constants'
import { riskCategoryCall } from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'
import {
  labelNamesAPI,
  labelNamesResponse,
  metricListAPI,
  metricListResponse,
  sampleDataAPI,
  sampleDataResponse,
  metricPackAPI,
  metricPackResponse,
  monitoredService,
  labelValuesAPI,
  monitoredServiceForBuildQuery,
  awsPrometheusMonitoredService
} from '../../../support/85-cv/monitoredService/health-sources/Prometheus/constant'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Health Source - Prometheus', () => {
  beforeEach(() => {
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('should be able to add Prometheus Health Source with manual query', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').should('contain.value', 'Prometheus Metric')
    cy.get('input[name="metricName"]').clear()
    cy.get('input[name="metricName"]').blur()

    cy.contains('span', 'Metric Name is required.').should('be.visible')
    cy.fillField('metricName', 'Prometheus Metric')
    cy.contains('span', 'Metric Name is required.').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('span', validations.groupName).should('be.visible')
    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')
    cy.contains('span', validations.groupName).should('not.exist')

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()

    cy.contains('p', 'Query Builder will not be available since this mapping contains a manually edited query.').should(
      'be.visible'
    )
    cy.contains('div', 'Build your Query').should('not.exist')

    cy.get('textarea[name="query"]').focus().blur()
    cy.contains('span', validations.query).should('be.visible')
    cy.findByRole('button', { name: /Fetch records/i }).should('be.disabled')
    cy.get('textarea[name="query"]').type(`classes	{}`)
    cy.contains('span', validations.query).should('not.exist')

    cy.contains('p', 'Submit query to see records from Prometheus').should('be.visible')

    cy.intercept('GET', sampleDataAPI, errorResponse)

    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('p', 'We cannot perform your request at the moment. Please try again.').should('exist')

    cy.intercept('GET', sampleDataAPI, { statusCode: 200, body: {} })

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.intercept('GET', sampleDataAPI, sampleDataResponse)

    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('div', 'Assign').click()
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', validations.assign).should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })
    cy.contains('span', validations.assign).should('not.exist')

    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="healthScore"]').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', validations.riskCategory).should('exist')
    cy.contains('label', 'Errors').click()
    cy.contains('span', validations.riskCategory).should('not.exist')

    cy.contains('span', 'Deviation Compared to Baseline is required.').should('exist')
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.contains('span', 'Deviation Compared to Baseline is required.').should('not.exist')

    cy.get('input[name="serviceInstance"]').click()
    cy.contains('p', '__name__').click()

    cy.findByRole('button', { name: /Add Metric/i }).click()

    cy.contains('div', 'Map Metric(s) to Harness Services').click()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.get('input[name="metricName"]').blur()

    cy.contains('span', 'Metric name must be unique.').should('be.visible')
    cy.fillField('metricName', 'Prometheus Metric 123')
    cy.contains('span', 'Metric name must be unique.').should('not.exist')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', 'Group 1').click()

    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()
    cy.get('textarea[name="query"]').type(`classes	{}`)

    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click({ force: true })
  })

  it('should be able to edit an existing Prometheus health source of manual query', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'Prometheus').click()

    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service updated').should('be.visible')
  })

  it('should be able to add Prometheus HS by building a query', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()

    cy.contains('p', 'Query Builder will not be available since this mapping contains a manually edited query.').should(
      'be.visible'
    )
    cy.contains('div', 'Build your Query').should('not.exist')

    cy.contains('p', 'Undo manual query selection').click()

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.contains('div', 'Build your Query').click()

    cy.intercept('GET', sampleDataAPI, sampleDataResponse)

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', 'Prometheus Metric is required.').should('be.visible')
    cy.get('input[name="prometheusMetric"]').click({ force: true })
    cy.contains('p', 'classes').click()
    cy.contains('span', 'Prometheus Metric is required.').should('not.exist')

    cy.intercept('GET', labelValuesAPI, metricListResponse)

    cy.contains('span', 'Filter on Environment is required.').should('be.visible')
    cy.get('input[name="envFilter"]').click({ force: true })
    cy.contains('p', '__name__').click()
    cy.contains('p', 'classes').click()
    cy.contains('span', 'Filter on Environment').click()
    cy.contains('span', 'Filter on Environment is required.').should('not.exist')

    cy.wait(1000)

    cy.contains('span', 'Filter on Service required.').should('be.visible')
    cy.get('input[name="serviceFilter"]').click({ force: true })
    cy.contains('p', 'generation').click()
    cy.contains('p', 'classes_loaded').click()
    cy.contains('span', 'Filter on Service').click()
    cy.contains('span', 'Filter on Service required.').should('not.exist')

    cy.wait(1000)

    cy.get('input[name="additionalFilter"]').click({ force: true })
    cy.contains('p', 'group').click()
    cy.contains('p', 'classes_unloaded').click()
    cy.contains('span', 'Additional Filter').click()

    cy.get('input[name="aggregator"]').click({ force: true })
    cy.contains('p', 'avg (calculate the average over dimensions)').click({ force: true })
    cy.wait(1000)
    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service created').should('be.visible')
  })

  it('should be able to edit an existing Prometheus health source of Build query', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredServiceForBuildQuery)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'Prometheus').click()

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)
    cy.intercept('GET', sampleDataAPI, sampleDataResponse)

    cy.findByRole('button', { name: /Next/i }).click()
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service updated').should('be.visible')
  })
})

describe('Prometheus metric thresholds', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'CVNG_METRIC_THRESHOLD',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('should render metric thresholds only if any group is created', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').clear()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')

    cy.addingGroupName('Group 1')

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Continuous Verification').click()

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')
  })

  it('should render metric thresholds and perform its features', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').clear()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.addingGroupName('Group 1')

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Continuous Verification').click()

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('be.disabled')
    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Custom')

    // validations
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findAllByText('Required').should('have.length', 3)

    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Prometheus Metric')

    cy.get('.Select--menuItem:nth-child(1)').click()

    // testing criteria

    cy.get("input[name='ignoreThresholds.0.criteria.type']").should('have.value', 'Absolute Value')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

    // greater than should be smaller than lesser than value
    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").type('12')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('1')

    cy.get("input[name='ignoreThresholds.0.criteria.type']").click()
    cy.contains('p', 'Percentage Deviation').click()

    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('not.exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('12')

    // Fail fast thresholds
    cy.contains('div', 'Fail-Fast Thresholds (0)').click()

    cy.findByTestId('AddThresholdButton').click()

    cy.get("input[name='failFastThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Prometheus Metric')

    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

    cy.get("input[name='failFastThresholds.0.spec.action']").click()
    cy.contains('p', 'Fail after multiple occurrences').click()
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

    cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
    cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')
  })

  it('should show prompt, if custom metrics containing metric thresholds are being deleted', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.fillField('metricName', 'Prometheus Metric 123')

    cy.addingGroupName('Group 1')

    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()
    cy.get('textarea[name="query"]').type(`classes	{}`)

    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.findByRole('button', { name: /Add Metric/i }).click()

    cy.contains('div', 'Map Metric(s) to Harness Services').click()

    cy.get('input[name="metricName"]').clear()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.get('input[name="groupName"]').click()

    cy.get('.Select--menuItem:nth-child(2)').should('have.text', 'Group 1')
    cy.get('.Select--menuItem:nth-child(2)').click()

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Continuous Verification').click()

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('be.disabled')
    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Custom')

    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Prometheus Metric')
    cy.get('.Select--menuItem:nth-child(1)').click()

    cy.get('span[data-icon="main-delete"]').first().should('exist').scrollIntoView().click()

    cy.contains('p', 'Warning').should('be.visible')

    cy.contains('button', 'Confirm').should('be.visible')
    cy.contains('button', 'Confirm').click()

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')
  })
})

describe('AWS Prometheus', () => {
  beforeEach(() => {
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('should render AWS Prometheus functionality correctly', () => {
    cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('awsRegionsCall')
    cy.intercept('GET', awsWorkspacesCall, workspaceMock).as('awsWorkspacesCall')
    cy.intercept('POST', awsConnectorCall).as('awsConnectorCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.contains('span', 'Add New Health Source').click()

    cy.contains('span', 'Next').click()

    cy.contains('span', 'Source selection is required').should('be.visible')
    cy.get(`span[data-icon=service-prometheus]`).click()
    cy.contains('span', 'Name is required.').should('be.visible')
    cy.get('input[name="healthSourceName"]').type('awsPrometheusTest')
    cy.contains('span', 'Source selection is required').should('not.exist')
    cy.contains('span', 'Name is required.').should('not.exist')
    cy.contains('span', 'Connection Type is required').should('exist')

    cy.findByPlaceholderText('- Select an AWS Region -').should('not.exist')
    cy.findByPlaceholderText('- Select a Workspace Id -').should('not.exist')

    cy.get('button[data-testid="cr-field-connectorRef"]').should('be.disabled')

    cy.contains('p', 'Amazon Web services').click()

    cy.wait('@awsRegionsCall')

    cy.get('button[data-testid="cr-field-connectorRef"]').should('not.be.disabled')

    cy.contains('span', 'Connector Selection is required.').should('be.visible')
    cy.get('button[data-testid="cr-field-connectorRef"]').click()

    cy.wait('@awsConnectorCall')

    cy.contains('p', 'testAWS').click()
    cy.contains('span', 'Apply Selected').click()
    cy.contains('span', 'Connector Selection is required.').should('not.exist')

    cy.contains('span', 'AWS Region is required').should('exist')
    cy.contains('span', 'Workspace Id is required').should('exist')

    cy.findByPlaceholderText('- Select an AWS Region -').click()
    cy.contains('p', 'region 1').click()

    cy.wait('@awsWorkspacesCall')

    cy.findByPlaceholderText('- Select a Workspace Id -').click()
    cy.contains('p', 'Workspace 1').click()

    cy.contains('span', 'AWS Region is required').should('not.exist')
    cy.contains('span', 'Workspace Id is required').should('not.exist')

    cy.get('input[value="region 1"]').click()

    cy.contains('p', 'region 2').click()

    cy.contains('span', 'Workspace Id is required').should('exist')

    cy.findByPlaceholderText('- Select a Workspace Id -').click()
    cy.contains('p', 'Workspace 1').click()

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.findByRole('button', { name: /Previous/i }).click()

    cy.get('input[value="AWS_PROMETHEUS"]').should('be.checked')

    cy.findByPlaceholderText('- Select a Workspace Id -').click()
    cy.contains('p', 'Workspace 1').click()

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').should('contain.value', 'Prometheus Metric')
    cy.get('input[name="metricName"]').clear()
    cy.get('input[name="metricName"]').blur()

    cy.contains('span', 'Metric Name is required.').should('be.visible')
    cy.fillField('metricName', 'Prometheus Metric')
    cy.contains('span', 'Metric Name is required.').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('span', validations.groupName).should('be.visible')
    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')
    cy.contains('span', validations.groupName).should('not.exist')

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()

    cy.contains('p', 'Query Builder will not be available since this mapping contains a manually edited query.').should(
      'be.visible'
    )
    cy.contains('div', 'Build your Query').should('not.exist')

    cy.get('textarea[name="query"]').focus().blur()
    cy.contains('span', validations.query).should('be.visible')
    cy.findByRole('button', { name: /Fetch records/i }).should('be.disabled')
    cy.get('textarea[name="query"]').type(`classes	{}`)
    cy.contains('span', validations.query).should('not.exist')

    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.intercept('POST', '/cv/api/monitored-service?*').as('monitoredServiceCall')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findByRole('button', { name: /Save/i }).click()

    cy.wait('@monitoredServiceCall').then(intercept => {
      const { sources } = intercept.request.body

      // Response assertion
      expect(sources?.healthSources?.[0]?.type).equals('AwsPrometheus')
      expect(sources?.healthSources?.[0]?.name).equals('awsPrometheusTest')
      expect(sources?.healthSources?.[0]?.identifier).equals('awsPrometheusTest')
      expect(sources?.healthSources?.[0]?.spec?.region).equals('region 2')
      expect(sources?.healthSources?.[0]?.spec?.workspaceId).equals('sjksm43455n-34x53c45vdssd-fgdfd232sdfad')
    })
  })

  it('should perform AWS Prometheus functionality in edit scenario', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', awsPrometheusMonitoredService).as(
      'monitoredServiceCall'
    )

    cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('awsRegionsCall')
    cy.intercept('GET', awsWorkspacesCall, workspaceMock).as('awsWorkspacesCall')
    cy.intercept('GET', awsConnectorCall).as('awsConnectorCall')

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.wait('@monitoredServiceCall')

    // clear any cached values
    cy.get('body').then($body => {
      if ($body.text().includes('Unsaved changes')) {
        cy.contains('span', 'Discard').click()
      }
    })

    cy.contains('div', 'AwsPrometheusTest').click({ force: true })

    cy.wait('@awsRegionsCall')
    cy.wait('@awsWorkspacesCall')

    cy.findByPlaceholderText('- Select an AWS Region -').should('be.disabled')
    cy.findByPlaceholderText('- Select a Workspace Id -').should('be.disabled')

    cy.get('input[value="region 1"]').should('exist')
    cy.get('input[value="Workspace 1"]').should('exist')

    cy.findByTestId(/thumbnail-select-change/).should('be.disabled')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.findByRole('button', { name: /Previous/i }).click()

    cy.get('input[value="AWS_PROMETHEUS"]').should('be.checked')

    cy.get('input[value="region 1"]').should('exist')
    cy.get('input[value="Workspace 1"]').should('exist')
  })
})
