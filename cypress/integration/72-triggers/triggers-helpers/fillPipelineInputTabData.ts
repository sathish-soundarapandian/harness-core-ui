import { inputSetListAPIWithoutSort } from '../../../support/70-pipeline/constants'
import { createTriggerAPIV2 } from '../constansts'

export const fillPipelineInputTabDataAndSubmitForm = ({ inputSetRefs = [], timeout = '10m', triggerYAML }): void => {
  if (inputSetRefs.length) {
    cy.intercept('GET', inputSetListAPIWithoutSort, {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_InputSets.json'
    }).as('inputSetListAPIWithoutSort')
  }

  // Move to Pipeline Input Tab
  cy.contains('span', 'Continue').click()

  // Pipeline Input Tab
  if (inputSetRefs.length) {
    cy.wait('@inputSetListAPIWithoutSort')
    cy.contains('span', 'Select Input Set(s)').click({ force: true })
    inputSetRefs.forEach(inputSetRef => {
      cy.contains('p', `Id: ${inputSetRef}`).click({ force: true })
    })
    cy.contains('span', 'Apply Input Set').click({ force: true })
  } else {
    cy.get('input[name="pipeline.stages[0].stage.spec.execution.steps[0].step.timeout"]').clear().type(timeout)
  }

  cy.intercept('POST', createTriggerAPIV2).as('createTriggerAPIV2')
  cy.get('button[type="submit"]').click()

  // Create API Call
  cy.wait('@createTriggerAPIV2').its('request.body').should('eq', triggerYAML)
}
