/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
  dataforMS,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  applicationCall,
  applicationsResponse,
  metricPackCall,
  metricPackResponse,
  tiersCall,
  tiersResponse,
  basePathCall,
  basePathResponse,
  metricStructureCall,
  metricStructureResponse,
  basePathCallWithoutTierAndApp
} from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Create empty monitored service', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('Add new AppDynamics monitored service ', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="Errors"]').should('be.checked')
    cy.get('input[name="Performance"]').should('be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select applications').should('be.visible')

    cy.get('input[name="Errors"]').uncheck({ force: true })
    cy.get('input[name="Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.metricPack).should('be.visible')
    cy.get('input[name="Errors"]').check({ force: true })
    cy.get('input[name="Performance"]').check({ force: true })
    cy.contains('span', validations.metricPack).should('not.exist')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    // Validation
    cy.contains('span', 'Please select applications').should('not.exist')
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Please select tier').should('be.visible')

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new AppDynamics monitored service with custom metric', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    // Adding custom metric should make metric pack oprional
    cy.get('input[name="Errors"]').uncheck({ force: true })
    cy.get('input[name="Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.metricPack).should('be.visible')
    cy.contains('span', 'Add Metric').click()
    cy.contains('span', validations.metricPack).should('not.exist')

    cy.contains('div', 'Assign').click({ force: true })

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.groupName).should('be.visible')
    cy.contains('span', 'Please select base path').scrollIntoView().should('be.visible')
    cy.contains('span', validations.assign).scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="basePath"]').click()
    cy.contains('p', 'Overall Application Performance').click({ force: true })

    cy.get('input[name="metricPathDropdown"]').click()
    cy.contains('p', 'Calls per Minute').click({ force: true })

    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'AppD').click({ force: true })
    cy.contains('span', 'Next').click({})

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')
    cy.get('input[name="groupName"]').should('have.value', 'group 1')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric')
    cy.get('input[name="basePath"]').should('have.value', 'Overall Application Performance')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance | docker-tier | Calls per Minute')
      .scrollIntoView()
      .should('be.visible')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new AppDynamics monitored service with multiple custom metric', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    // Adding custom metric should make metric pack oprional
    cy.get('input[name="Errors"]').uncheck({ force: true })
    cy.get('input[name="Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.metricPack).should('be.visible')
    cy.contains('span', 'Add Metric').click()
    cy.contains('span', validations.metricPack).should('not.exist')

    cy.contains('div', 'Assign').click({ force: true })

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.groupName).should('be.visible')
    cy.contains('span', 'Please select base path').scrollIntoView().should('be.visible')
    cy.contains('span', validations.assign).scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="basePath"]').click()
    cy.contains('p', 'Overall Application Performance').click({ force: true })

    cy.get('input[name="metricPathDropdown"]').click()
    cy.contains('p', 'Calls per Minute').click({ force: true })

    cy.get('input[name="sli"]').click({ force: true })

    // Add 2nd Metric
    cy.contains('span', 'Add Metric').click({ force: true })

    // validate duplicate name and metric identifier
    cy.get('input[name="metricName"]').clear().type('appdMetric')
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Metric name must be unique').should('be.visible')
    cy.get('input[name="metricName"]').clear().type('appdMetric 2')
    cy.get('.InputWithIdentifier--txtNameContainer [data-icon="Edit"]').click({ force: true })
    cy.get('input.bp3-editable-text-input').click({ force: true }).clear().type('appdMetric', { force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Metric identifier must be unique').should('be.visible')
    cy.get('.InputWithIdentifier--txtNameContainer [data-icon="Edit"]').click({ force: true })
    cy.get('input.bp3-editable-text-input').click({ force: true }).clear().type('appdMetric_2', { force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Metric identifier must be unique').should('not.exist')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')

    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })
    cy.contains('span', 'group 1 already exists. Provide a unique name').should('be.visible')
    cy.get('.bp3-overlay input[name="name"]').clear().type('group 2')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="basePath"]').click()
    cy.contains('p', 'Overall Application Performance').click({ force: true })

    cy.get('input[name="metricPathDropdown"]').click()
    cy.contains('p', 'Calls per Minute').click({ force: true })
    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })
    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')
    cy.get('input[name="groupName"]').should('have.value', 'group 1')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric')
    cy.get('input[name="basePath"]').should('have.value', 'Overall Application Performance')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance | docker-tier | Calls per Minute')
      .scrollIntoView()
      .should('be.visible')
    cy.contains('span', 'Submit').click({ force: true })
    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Delete').click()
    cy.get('.ConfirmationDialog--dialog button[type="button"]').first().click()

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('should delete values in AppDynamics healthsource edit mode', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', dataforMS).as('monitoredServiceCall')
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.wait('@monitoredServiceCall')

    cy.contains('div', 'AppD Edit Mode').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')

    cy.intercept('GET', basePathCallWithoutTierAndApp, { ...basePathResponse, data: [] }).as('basePathCall')

    cy.get('[class*="tierDropdown"] [icon="cross"]').click({ force: true })
    cy.get('input[name="appDTier"]').should('have.value', '')
    cy.get('[class*="applicationDropdown"] [icon="cross"]').click({ force: true })
    cy.get('input[name="appdApplication"]').should('have.value', '')
    cy.get('input[name="appDTier"]').should('not.exist')
  })

  it('should populate AppDynamics healthsource edit mode', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', dataforMS).as('monitoredServiceCall')
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.wait('@monitoredServiceCall')

    cy.contains('div', 'AppD Edit Mode').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="appDTier"]').should('have.value', 'docker-tier')
    cy.get('input[name="appdApplication"]').should('have.value', 'cv-app')
    cy.get('input[name="groupName"]').should('have.value', 'Group 1')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric 101')
    cy.get('input[name="basePath"]').should('have.value', 'Overall Application Performance')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance | docker-tier | Calls per Minute')
      .scrollIntoView()
      .should('be.visible')

    cy.contains('p', 'appdMetric 10').click()

    cy.get('input[name="groupName"]').should('have.value', 'Group 2')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric 10')
    cy.get('input[name="basePath"]').should('have.value', 'Overall Application Performance')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance | docker-tier | Calls per Minute')
      .scrollIntoView()
      .should('be.visible')

    // Update values and verify
    cy.get('input[name="metricName"]').scrollIntoView().type(' updated')
    cy.contains('label', 'Select the path from the AppD metric').click()
    cy.get('input[name="metricPathDropdown"]').click()
    cy.contains('p', 'Calls per Minute').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.contains('p', 'appdMetric 10 updated').click()
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric 10 updated')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance | docker-tier | Calls per Minute')
      .scrollIntoView()
      .should('be.visible')

    // Setting empty metric name doesn't rest form
    cy.get('input[name="metricName"]').clear()
    cy.get('input[name="metricName"]').should('have.value', '')
    cy.get('input[name="groupName"]').should('have.value', 'Group 2')
    cy.get('input[name="basePath"]').should('have.value', 'Overall Application Performance')
    cy.get('input[name="metricPathDropdown"]').should('have.value', 'Calls per Minute')
    cy.contains('p', 'Overall Application Performance | docker-tier | Calls per Minute')
      .scrollIntoView()
      .should('be.visible')
    cy.get('input[name="metricName"]').type('appdMetric 10 updated')

    cy.contains('span', 'Add Metric').click({ force: true })

    // delete metric and verify
    cy.get('input[name="metricName"]').scrollIntoView().clear().type('delete me')
    cy.get('span[data-icon="main-delete"]').first().click()
    cy.contains('p', 'delete me').should('not.exist')
    cy.contains('span', 'Add Metric').click({ force: true })
    cy.get('input[name="metricName"]').scrollIntoView().clear().type('delete me')
    cy.contains('p', 'appdMetric 10 updated').click()
    cy.get('span[data-icon="main-delete"]').first().click()
    cy.contains('p', 'delete me').should('not.exist')

    // Dupllicate check
    cy.contains('span', 'Add Metric').click({ force: true })
    cy.get('input[name="metricName"]').clear().type('appdMetric 101')
    cy.get('input[name="groupName"]').click()
    cy.contains('span', 'Metric name must be unique').scrollIntoView().should('be.visible')
    cy.contains('p', 'appdMetric 101').click()
    cy.get('input[name="groupName"]').should('have.value', 'Group 1')
    cy.contains('p', 'appdMetric 10').click()
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric 10')

    // Delete all custom metric
    cy.get('span[data-icon="main-delete"]').click({ multiple: true })
    cy.findByRole('button', { name: /Add Metric/i }).should('be.visible')
  })
})

describe('Metric thresholds in AppDynamics', () => {
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
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })
  it('should test metric thresholds renders correctly and should hide metric thresholds if no metric packs are selected', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    // If no metric pack is selected, metric thresholds should be hidden
    cy.get('input[name="Errors"]').uncheck({ force: true })
    cy.get('input[name="Performance"]').uncheck({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')
  })

  it('should add thresholds and do all the operations as expected', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Performance')

    // validations
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findAllByText('Required').should('have.length', 4)

    cy.get("input[name='ignoreThresholds.0.groupName']").type('*')
    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(3)').click()

    cy.get("input[name='ignoreThresholds.0.metricName']").should('have.value', 'Calls per Minute')

    // changing metric type should reset groupName and metric name
    cy.get("input[name='ignoreThresholds.0.metricType']").click()

    cy.get('.Select--menuItem:nth-child(1)').click()

    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Errors')

    cy.get("input[name='ignoreThresholds.0.metricName']").should('have.value', '')
    cy.get("input[name='ignoreThresholds.0.groupName']").should('have.value', '')

    // testing criteria

    cy.get("input[name='ignoreThresholds.0.criteria.type']").should('have.value', 'Absolute Value')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

    // greater than should be smaller than lesser than value
    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").type('12')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('1')

    cy.get("input[name='ignoreThresholds.0.criteria.type']").click()
    cy.contains('p', 'Percentage Deviation').click()

    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('not.exist')

    cy.get("input[name='ignoreThresholds.0.criteria.criteriaPercentageType']").click()
    cy.contains('p', 'Lesser than').click()

    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('not.exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

    cy.get("input[name='ignoreThresholds.0.groupName']").type('*')
    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').click()

    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('12')

    // Fail fast thresholds
    cy.contains('div', 'Fail-Fast Thresholds (0)').click()

    cy.findByTestId('AddThresholdButton').click()

    cy.get("input[name='failFastThresholds.0.groupName']").type('*')

    cy.get("input[name='failFastThresholds.0.metricName']").click()
    cy.contains('p', 'Calls per Minute').click()

    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

    cy.get("input[name='failFastThresholds.0.spec.action']").click()
    cy.contains('p', 'Fail after multiple occurrences').click()
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

    cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
    cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')

    // Adding custom metrics
    cy.contains('span', 'Add Metric').click()

    cy.contains('div', 'Assign').click({ force: true })

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.contains('span', 'Continuous Verification').click()

    cy.get("input[name='failFastThresholds.0.metricType']").click()

    cy.get('.Select--menuItem:nth-child(3)').should('have.text', 'Custom')
    cy.get('.Select--menuItem:nth-child(3)').click()

    // group name should have created group name option
    cy.get("input[name='failFastThresholds.0.groupName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'group 1')
    cy.get('.Select--menuItem:nth-child(1)').click()

    // Selected group's metric name must be listed
    cy.get("input[name='failFastThresholds.0.metricName']").click()
    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'appdMetric')
    cy.get('.Select--menuItem:nth-child(1)').click()
  })

  it('should show prompt, if metric packs containing metric thresholds are being removed', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Performance')

    cy.get('input[name="Performance"]').scrollIntoView().click({ force: true })

    cy.contains('p', 'Warning').should('be.visible')

    cy.contains('button', 'Confirm').should('be.visible')
    cy.contains('button', 'Confirm').click()

    cy.contains('div', 'Ignore Thresholds (0)').should('exist')
  })

  it('should show prompt, if custom metrics containing metric thresholds are being deleted', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').click()
    cy.contains('p', 'cv-app').click({ force: true })

    cy.wait('@TierCall')
    cy.get('input[name="appDTier"]').click()
    cy.contains('p', 'docker-tier').click({ force: true })

    // Adding custom metrics
    cy.contains('span', 'Add Metric').click()

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Continuous Verification').scrollIntoView().click({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").click()

    cy.get('.Select--menuItem:nth-child(3)').should('have.text', 'Custom')
    cy.get('.Select--menuItem:nth-child(3)').click()

    // group name should have created group name option
    cy.get("input[name='ignoreThresholds.0.groupName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'group 1')
    cy.get('.Select--menuItem:nth-child(1)').click()

    cy.get("input[name='ignoreThresholds.0.groupName']").should('have.value', 'group 1')
    // Selected group's metric name must be listed
    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'appdMetric')
    cy.get('.Select--menuItem:nth-child(1)').click()

    cy.get('span[data-icon="main-delete"]').should('exist').scrollIntoView().click()

    cy.contains('p', 'Warning').should('be.visible')

    cy.contains('button', 'Confirm').should('be.visible')
    cy.contains('button', 'Confirm').click()

    cy.contains('div', 'Ignore Thresholds (0)').should('exist')
  })
})
