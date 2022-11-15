import { listRepositoriesAPI, pipelineListAPI } from '../../support/70-pipeline/constants'

describe('Pipeline list view with repo Filter', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', listRepositoriesAPI, {
      fixture: 'pipeline/api/pipelines/repoList.json'
    }).as('listRepositories')

    cy.intercept('POST', pipelineListAPI, {
      fixture: 'pipeline/api/pipelines/getPipelineList.json'
    }).as('pipelineList')

    cy.login('test', 'test')
    cy.visitPipelinesList()
    cy.wait('@pipelineList')
    cy.wait('@listRepositories')
  })

  it('should render repo filter', () => {
    cy.contains('p', 'Select Repository').should('be.visible')
    cy.contains('p', 'Select Repository').should('exist').click({ force: true })
    // cy.contains('p', 'main').should('be.visible')
  })
  it('should show refetch button if api fails', () => {
    cy.intercept('GET', listRepositoriesAPI, {
      statusCode: 500
    }).as('listRepoApi')
    cy.wait('@listRepoApi').its('response.statusCode').should('eq', 500)
    cy.get('.PageSubHeader--container').within(() => {
      cy.get('[icon="refresh"]').should('be.visible')
    })
  })
})
