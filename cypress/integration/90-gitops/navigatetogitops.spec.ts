describe('navigate to gitops', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.visitGitops()
  })

  it('check pipeline list view info', () => {
    cy.contains('p', 'Total: 3').should('be.visible')

    cy.contains('p', 'Parallel Pipelines').should('be.visible')
    cy.contains('p', 'Id: Parallel_Pipelines').should('be.visible')

    cy.contains('p', 'Stages').should('be.visible')
    cy.contains('p', 'Stage1').should('be.visible')
    cy.contains('p', '+6').should('be.visible')
  })
})
