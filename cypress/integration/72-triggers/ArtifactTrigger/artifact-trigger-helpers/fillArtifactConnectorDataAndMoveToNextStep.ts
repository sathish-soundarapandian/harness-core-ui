export const fillArtifactConnectorDataAndMoveToNextStep = (connectorId): void => {
  if (connectorId) {
    cy.log('connectorId', connectorId)
    cy.get('[data-testid="cr-field-connectorId"]').click()
    cy.contains('p', `Id: ${connectorId}`).click({ force: true })
    cy.contains('span', 'Apply Selected').click()
    cy.get('button[type="submit"]').click()
  }
}
