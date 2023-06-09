/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const fillConditionTabData = (
  { buildCondition, metadataConditions, jexlCondition } = {
    buildCondition: { buildOperator: 'Equal', buildValue: '1' },
    metadataConditions: [
      {
        key: '<+trigger.artifact.metadata.field>',
        operator: 'Equal',
        value: '1'
      }
    ],
    jexlCondition: '<+trigger.payload.repository.owner.name> == "harness"'
  }
): void => {
  // Move to Conditions Tab
  cy.contains('span', 'Continue').click()

  //Artifact Build Condition
  const { buildOperator, buildValue } = buildCondition
  cy.get('input[name="buildOperator"]').clear().type(buildOperator)
  cy.contains('p', buildOperator).click({ force: true })
  cy.get('input[name="buildValue"]').clear().clear().type(buildValue)

  //Metadata Conditions
  metadataConditions.forEach((metadataCondition, index) => {
    const { key, operator, value } = metadataCondition
    cy.contains('p', '+ Add').click()
    cy.get(`input[name="metaDataConditions.${index}.key"]`).clear().clear().type(key)
    cy.get(`input[name="metaDataConditions.${index}.operator"]`).clear().type(operator)
    cy.contains('p', operator).click({ force: true })
    cy.get(`input[name="metaDataConditions.${index}.value"]`).clear().clear().type(value)
  })

  // JEXL Condition
  cy.get('input[name="jexlCondition"]').clear().clear().type(jexlCondition)
}
