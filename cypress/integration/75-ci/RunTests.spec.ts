import {
  addStepToPipeline,
  addTemplate,
  BasePipelineTypes,
  selectStage,
  selectStepInStepLibrary,
  setupBasePipeline,
  visitTemplatesPage
} from '../../support/75-ci/CIpipeline.utils'

const runtimeInputParagraphLabels = ['Container Registry', 'Image']

describe('Run Tests Step', () => {
  beforeEach(() => {
    setupBasePipeline(BasePipelineTypes.BASE_ECHO)
  })

  it('adds run tests step with connectorRef and image to k8 pipeline', () => {
    selectStage('CI_Stage1')
    addStepToPipeline()
    selectStepInStepLibrary('Run Tests')
    cy.get('button[data-testid="cr-field-spec.connectorRef"]').click({ force: true })
    cy.wait(500)
    cy.get('.ConnectorReferenceField-module_leftInfo_NnbjCW').eq(0).click({ force: true })
    cy.get('.bp3-button-text').contains('Apply Selected').click()
    cy.get('.bp3-input-group').eq(1).type('Image')
    cy.get('.bp3-input-group').eq(2).click()
    cy.get('.bp3-menu').children().first().click()
    cy.get('.bp3-input-group').eq(3).click()
    cy.wait(500)
    cy.get('.bp3-menu').children().first().click()
    cy.get('.bp3-input-group').eq(4).type('test')
    cy.get('.bp3-button').contains('span', 'Add').click()
    cy.get('.bp3-input-group').eq(5).type('**/*.xml')
    cy.get('.bp3-button-text').contains('Apply Changes').click()
  })
  it('adds run tests step without connectorRef and image to non k8 pipeline', () => {
    selectStage('CI_Stage1')
    cy.get('div[data-testid="Infrastructure"]').click({ force: true })
    cy.get('.bp3-card').contains('p', 'Local').click()
    cy.get('.bp3-input-group').eq(1).click()
    cy.get('.bp3-menu').children().first().click()
    cy.get('.bp3-button-text').contains('Continue').click()
    addStepToPipeline()
    selectStepInStepLibrary('Run Tests')
    cy.get('.bp3-input-group').eq(1).click()
    cy.get('.bp3-menu').children().first().click()
    cy.get('.bp3-input-group').eq(2).click()
    cy.wait(500)
    cy.get('.bp3-menu').children().first().click()
    cy.get('.bp3-input-group').eq(3).type('test')
    cy.get('.bp3-button').contains('span', 'Add').click()
    cy.get('.bp3-input-group').eq(4).type('**/*.xml')
    cy.get('.bp3-button-text').contains('Apply Changes').click()
  })
})

describe('Run Test Step Template', () => {
  beforeEach(() => {
    visitTemplatesPage()
  })

  it('TEMPLATE: verify Run Tests step has ConnectorRef and Image only as additional configuration', () => {
    addTemplate('Run Tests step')
    selectStepInStepLibrary('Run Tests')

    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('form p').not(fieldName)
    })

    cy.get('[class*="SplitPane"]').scrollTo('0%', '50%', { ensureScrollable: false })
    cy.contains('div', 'Additional Configuration').should('be.visible')
    cy.contains('div', 'Additional Configuration').click()

    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('form p').contains(fieldName)
    })
  })
})
