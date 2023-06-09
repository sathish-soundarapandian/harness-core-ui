import { visitTriggersPage } from './triggers-helpers/visitTriggersPage'
const getTriggerListAPIFixture = 'pipeline/api/triggers/Cypress_Test_Trigger_Get_Trigger_List.json'

describe('Triggers', () => {
  visitTriggersPage(getTriggerListAPIFixture)

  it('Listing page should list all the triggers in the pipeline', () => {
    cy.fixture(getTriggerListAPIFixture).then(getTriggerListAPIResponse => {
      const { totalItems, content } = getTriggerListAPIResponse.data

      cy.get('.TableV2--row').should('have.length', totalItems)
      content.forEach(({ identifier }) => {
        cy.contains('p', `Id: ${identifier}`).should('be.visible')
      })
    })
  })
})
