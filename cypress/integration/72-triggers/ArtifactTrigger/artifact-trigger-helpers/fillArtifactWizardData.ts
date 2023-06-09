/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const fillArtifactWizardData = ({ connectorId, fillArtifactData }): void => {
  // Connector
  if (connectorId) {
    cy.get('[data-testid="cr-field-connectorId"]').click()
    cy.contains('p', connectorId).click()
    cy.contains('span', 'Apply Selected').click()
    cy.get('button[type="submit"]').click()
  }

  // Specific to Artifact type
  fillArtifactData()

  // Submit artifact
  cy.get('button[type="submit"]').click()
}
