import { addHashInCypressURLBasedOnBrowserRouter } from '../../utils/windowLocation'
import { overviewPage, orgOverviewPage, projectOverviewPage, getOrgCall } from './constants'

describe('check if Route is available if FF is enabled', () => {
  beforeEach(() => {
    cy.intercept('GET', getOrgCall, { fixture: 'pipeline/api/organization/getOrganization' }).as('getOrgCall')
    cy.initializeRoute()
  })

  it('should find FreezeWindows at Account level, and should redirect to Freeze List Page', () => {
    cy.visit(overviewPage, { timeout: 30000 })
    cy.visitPageAssertion('.PageHeader--container')
    cy.get('div a p').contains('Freeze Windows').as('freezeWindowsLink')
    cy.get('@freezeWindowsLink').click()
    cy.wait(500)
    cy.location().should(loc => {
      expect(loc.pathname).contains(
        `${addHashInCypressURLBasedOnBrowserRouter()}account/accountId/settings/freeze-windows`
      )
    })
    cy.get('button span').contains('New Freeze Window')
  })

  it('should find FreezeWindows at Organization level, and should redirect to Freeze List Page', () => {
    cy.visit(orgOverviewPage, { timeout: 30000 })
    cy.visitPageAssertion('.PageHeader--container')
    cy.get('div h1').contains('Organization Level Governance')
    cy.get('div div.bp3-card p span').contains('Freeze Windows').as('freezeWindowsLink')
    cy.get('@freezeWindowsLink').click()
    cy.wait(500)
    cy.location().should(loc => {
      expect(loc.pathname).contains(
        `${addHashInCypressURLBasedOnBrowserRouter()}account/accountId/settings/organizations/default/setup/freeze-windows`
      )
    })
    cy.get('button span').contains('New Freeze Window')
  })

  it('should find FreezeWindows at Project level, and should redirect to Freeze List Page ', () => {
    cy.visit(projectOverviewPage, { timeout: 30000 })
    cy.visitPageAssertion('.PageHeader--container')
    cy.get('div p').contains('Project Setup').as('projectSetupNode')
    cy.get('@projectSetupNode').click()
    cy.wait(500)
    cy.get('span.bp3-icon-chevron-up').should('have.length', 1)
    cy.get('div a p').contains('Freeze Windows').as('freezeWindowsLink')
    cy.get('@freezeWindowsLink').click()
    cy.wait(500)
    cy.location().should(loc => {
      expect(loc.pathname).contains(
        `${addHashInCypressURLBasedOnBrowserRouter()}account/accountId/cd/orgs/default/projects/project1/setup/freeze-windows`
      )
    })
    cy.get('button span').contains('New Freeze Window')
  })
})
