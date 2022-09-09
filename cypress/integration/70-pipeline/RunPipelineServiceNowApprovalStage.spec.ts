/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

describe('RUN PIPELINE MODAL - ServiceNow Approval Stage', () => {
  const gitSyncCall =
    '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const stepsCall = '/pipeline/api/pipelines/v2/steps?routingId=accountId&accountId=accountId'
  const serviceNowYamlSnippetCall =
    '/pipeline/api/approvals/stage-yaml-snippet?routingId=accountId&approvalType=SERVICENOW_APPROVAL'
  const serviceNowConnectorsCall =
    '/ng/api/connectors?accountIdentifier=accountId&type=ServiceNow&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=project1&orgIdentifier=default'

  const serviceNowTicketTypesCall =
    'ng/api/servicenow/ticketTypes?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=service_now_connector'

  const serviceNowMetadataCall =
    'ng/api/servicenow/metadata?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=service_now_connector&ticketType=INCIDENT'

  const serviceNowTemplateCall =
    'ng/api/servicenow/getTemplate?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=service_now_connector&ticketType=INCIDENT&templateName=&limit=1&offset=0'
  const serviceNowTemplateCallWithName =
    'ng/api/servicenow/getTemplate?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=service_now_connector&ticketType=INCIDENT&templateName=Test_TemplateName&limit=1&offset=0'

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.intercept('GET', serviceNowYamlSnippetCall, { fixture: 'pipeline/api/serviceNowStage/stageYamlSnippet' }).as(
      'stageYaml'
    )
    cy.intercept('POST', stepsCall, { fixture: 'pipeline/api/approvals/steps' })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()
    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Approval').click()
    cy.fillName('ServiceNowStageTest')
    cy.contains('p', 'ServiceNow').click({ multiple: true })
    cy.clickSubmit()
  })

  //After adding Approval stage, add ServiceNow
  it('should display the delete pipeline stage modal', () => {
    cy.wait('@stageYaml')
    cy.wait(1000)
    cy.get('[icon="play"]').click({ force: true, multiple: true })
    cy.wait(2000)
    cy.contains('p', 'ServiceNowStageTest').trigger('mouseover')
    cy.get('[icon="cross"]').click({ force: true })
    cy.contains('p', 'Delete Pipeline Stage').should('be.visible')
    cy.contains('span', 'Delete').click({ force: true })
    cy.contains('span', 'Pipeline Stage Successfully removed.').should('be.visible')
  })

  describe('ServiceNow Create Form Test', () => {
    it('Submit empty form Validations', () => {
      cy.wait('@stageYaml')
      cy.contains('span', 'Advanced').click({ force: true })
      cy.wait(1000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Create').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Step Name is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'ServiceNow Connector is required')
        .should('be.visible')
        .should('have.class', 'FormError--error')
      cy.contains('span', 'Ticket Type is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Description is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Short Description is required').should('be.visible').should('have.class', 'FormError--error')
      cy.wait(1000)
    })

    it('Submit form after filling details - Configure Fields', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.intercept('GET', serviceNowTemplateCall, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Create').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Create')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.description', 'Test_Description')
      cy.wait(1000)
      cy.fillField('spec.shortDescription', 'Test_ShortDescription')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })

    it('Submit form required field check - Create From Template', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.intercept('GET', serviceNowTemplateCall, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Create').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Create')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.get('[type="radio"]').check('CreateFromTemplate', { force: true })
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Template Name is required').should('be.visible').should('have.class', 'FormError--error')
    })

    it('Submit form after filling fields  - Create From Template', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.intercept('GET', serviceNowTemplateCall, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.intercept('GET', serviceNowTemplateCallWithName, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Create').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Create')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.get('[type="radio"]').check('CreateFromTemplate', { force: true })
      cy.wait(1000)
      cy.fillField('spec.templateName', 'Test_TemplateName')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })
  })

  describe('ServiceNow Approval Form Test', () => {
    it('Submit empty form Validations', () => {
      cy.wait('@stageYaml')
      cy.contains('span', 'Advanced').click({ force: true })
      cy.wait(1000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Approval').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Step Name is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'ServiceNow Connector is required')
        .should('be.visible')
        .should('have.class', 'FormError--error')
      cy.contains('span', 'Ticket Type is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Ticket Number is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('p', 'At least one condition is required').should('be.visible')
    })

    it('Submit form after filling details', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Approval').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Approval')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.ticketNumber', 'Test_123')
      cy.wait(1000)
      cy.contains('span', 'Add').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.approvalCriteria.spec.conditions[0].value', 'To Do')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })
  })

  describe('ServiceNow Update Form Test', () => {
    it('Submit empty form Validations', () => {
      cy.wait('@stageYaml')
      cy.contains('span', 'Advanced').click({ force: true })
      cy.wait(1000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Update').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Step Name is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'ServiceNow Connector is required')
        .should('be.visible')
        .should('have.class', 'FormError--error')
      cy.contains('span', 'Ticket Type is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Ticket Number is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Description is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Short Description is required').should('be.visible').should('have.class', 'FormError--error')
      cy.wait(1000)
    })

    it('Submit form after filling details', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.intercept('GET', serviceNowTemplateCall, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Update').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Update')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.ticketNumber', 'Test_123')
      cy.wait(1000)
      cy.fillField('spec.description', 'Test_Description')
      cy.wait(1000)
      cy.fillField('spec.shortDescription', 'Test_ShortDescription')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })

    it('Submit empty form Validations - Create From Template', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.intercept('GET', serviceNowTemplateCall, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Update').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Update')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.ticketNumber', 'Test_123')
      cy.wait(1000)
      cy.get('[type="radio"]').check('CreateFromTemplate', { force: true })
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Template Name is required').should('be.visible').should('have.class', 'FormError--error')
    })

    it('Submit form after filling details - Create From Template', () => {
      cy.intercept('GET', serviceNowConnectorsCall, { fixture: 'ng/api/serviceNow/serviceNowConnectors' })
      cy.intercept('GET', serviceNowTicketTypesCall, { fixture: 'ng/api/serviceNow/serviceNowTicketTypes' })
      cy.intercept('GET', serviceNowMetadataCall, { fixture: 'ng/api/serviceNow/serviceNowMetadata' })
      cy.intercept('GET', serviceNowTemplateCall, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.intercept('GET', serviceNowTemplateCallWithName, { fixture: 'ng/api/serviceNow/serviceNowTemplate' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'ServiceNow Update').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('input[placeholder="Enter Step Name"]').type('Service Now Update')
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'service_now_connector').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.ticketType"]').click({ force: true })
      cy.contains('p', 'Incident').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.ticketNumber', 'Test_123')
      cy.wait(1000)
      cy.get('[type="radio"]').check('CreateFromTemplate', { force: true })
      cy.wait(1000)
      cy.fillField('spec.templateName', 'Test_TemplateName')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })
  })
})
