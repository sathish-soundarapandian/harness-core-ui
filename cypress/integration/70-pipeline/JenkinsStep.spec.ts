import { connectorInfo, connectorsList, connectorsListAPI } from '../../support/35-connectors/constants'
import {
  gitSyncEnabledCall,
  inputSetsTemplateCall,
  jobDetailsCall,
  jobDetailsCallAfterConnectorChange,
  jobParametersList,
  pipelineDetails,
  pipelineSaveCall,
  pipelineStudioRoute,
  stepLibrary
} from '../../support/70-pipeline/constants'

describe('Connectors list', () => {
  const visitExecutionStageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
    cy.wait('@inputSetsTemplateCall', { timeout: 30000 })
    cy.wait('@pipelineDetailsAPIRoute', { timeout: 30000 })
    cy.wait(2000)
  }

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()

    cy.intercept('GET', gitSyncEnabledCall, {
      connectivityMode: null,
      gitSyncEnabled: false,
      gitSimplificationEnabled: false
    })
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
    cy.intercept('POST', stepLibrary, { fixture: 'pipeline/api/jenkinsStep/stepLibraryResponse.json' }).as(
      'stepLibrary'
    )
    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'pipeline/api/jenkinsStep/inputSetTemplateResponse.json'
    }).as('inputSetsTemplateCall')
    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/jenkinsStep/pipelineDetails.json' }).as(
      'pipelineDetailsAPIRoute'
    )
    cy.intercept('GET', connectorInfo, { fixture: 'pipeline/api/jenkinsStep/connectorInfo.json' }).as('connectorInfo')
    cy.intercept('GET', jobDetailsCall, { fixture: 'pipeline/api/jenkinsStep/jobDetails.json' }).as('jobDetailsCall')
    cy.intercept('GET', connectorsList, { fixture: 'pipeline/api/connector/connectorList.json' }).as(
      'connectorsListCall'
    )
    cy.intercept('GET', jobDetailsCallAfterConnectorChange, { fixture: 'pipeline/api/jenkinsStep/jobDetails.json' }).as(
      'jobDetailsCallAfterConnectorChange'
    )
    cy.intercept('GET', jobParametersList, { fixture: 'pipeline/api/jenkinsStep/jobParameterResponse.json' }).as(
      'jobParametersList'
    )
    visitExecutionStageWithAssertion()
  })
  it('jenkins step edition', () => {
    cy.contains('p', 'Jenkins').should('be.visible')
    cy.contains('p', 'Jenkins').click()
    cy.get('span[data-icon="service-jenkins"]').click({ force: true })
    cy.get('button[data-testid="cr-field-spec.connectorRef"]').click()
    cy.contains('p', 'testConnector2').click()
    cy.contains('span', 'Apply Selected').click()
    cy.get('input[name="spec.jobName"]').click()
    cy.contains('p', 'AutomationQA').click()
    cy.contains('span', 'Apply Changes').click()
    cy.wait(1000)
    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/jenkinsStep/pipelineDetailsAfterSave.json' }).as(
      'pipelineDetailsAPIRouteAfterSave'
    )
    cy.contains('span', 'Save').click()
  })
})
