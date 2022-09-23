import {
  inputSetsTemplateCall,
  pipelineDetails,
  pipelineDetailsWithRoutingIdCall,
  pipelineStudioRoute,
  s3bucketData,
  triggersList
} from '../../support/70-pipeline/constants'

describe('AmazonS3 Trigger', () => {
  const visitTriggersPageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
  }

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()

    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/triggers/amazonS3PipelineDetails.json' }).as(
      'pipelineDetails'
    )

    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'pipeline/api/triggers/amazonS3InputSetTemplateCallResponse.json'
    }).as('inputSetsTemplateCall')

    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'pipeline/api/triggers/amazonS3PipelineDetailWithRoutingIdCall.json'
    }).as('pipelineDetailWithRoutingIdCall')

    cy.intercept('GET', s3bucketData, {
      fixture: 'pipeline/api/triggers/s3BucketResponse.json'
    }).as('s3bucketData')

    visitTriggersPageWithAssertion()
  })

  it('testing amazonS3 trigger - when filePathRegex is runtime', () => {
    cy.contains('a', 'Triggers').click()
    cy.wait(1000)
    cy.contains('span', '+ New Trigger').click()
    cy.get('section[data-cy="Artifact_Amazon S3"]').click()
    cy.findByPlaceholderText('Enter Name').clear().type('amazonS3Trigger')
    cy.contains('p', '+ Select Artifact').click()
    cy.get('.TableV2--cells').eq(0).click()
    cy.contains('span', 'Select').click()
    cy.wait(1000)
    cy.findByPlaceholderText('Select or Add bucket name').click()
    cy.contains('p', 'tdp-tdp1-vzx7j8k9faso').click()
    cy.get(
      'input[name="stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.filePathRegex"]'
    )
      .clear()
      .type('testRegex')
    cy.contains('span', 'Apply').click()
    cy.contains('span', 'Continue').click()
    cy.contains('span', 'Continue').click()
    cy.intercept('GET', triggersList, {
      fixture: 'pipeline/api/triggers/triggersList.json'
    }).as('triggersList')
    cy.contains('span', 'Create Trigger').click()
    cy.wait(1000)
    cy.contains('p', 'amazonS3Trigger').should('be.visible')
  })

  it('testing amazonS3 trigger - when filePathRegex is fixed', () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'pipeline/api/triggers/amazonS3PipelineDetailsWithFilePathRegexFixed.json'
    }).as('pipelineDetails')

    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'pipeline/api/triggers/amazonS3InputSetTemplateWithFilePathRegexFixed.json'
    }).as('inputSetsTemplateCall')

    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'pipeline/api/triggers/amazonS3PipelineDetailWithRoutingIdCallWithFilePathRegexFixed.json'
    }).as('pipelineDetailWithRoutingIdCall')

    cy.contains('a', 'Triggers').click()
    cy.wait(1000)
    cy.contains('span', '+ New Trigger').click()
    cy.get('[data-cy="Artifact_Amazon S3"]').click()
    cy.findByPlaceholderText('Enter Name').clear().type('amazonS3Trigger')
    cy.contains('p', '+ Select Artifact').click()
    cy.get('.TableV2--cells').eq(0).click()
    cy.contains('span', 'Select').click()
    cy.wait(1000)
    cy.findByPlaceholderText('Select or Add bucket name').click()
    cy.contains('p', 'tdp-tdp1-vzx7j8k9faso').click()
    cy.get('input[disabled]').should('be.visible')
    cy.contains('span', 'Apply').click()
    cy.contains('span', 'Continue').click()
    cy.contains('span', 'Continue').click()
    cy.intercept('GET', triggersList, {
      fixture: 'pipeline/api/triggers/triggersList.json'
    }).as('triggersList')
    cy.contains('span', 'Create Trigger').click()
    cy.wait(1000)
    cy.contains('p', 'amazonS3Trigger').should('be.visible')
  })
})
