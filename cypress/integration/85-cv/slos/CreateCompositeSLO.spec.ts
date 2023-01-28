/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getSLOMetrics,
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOMetricsCallResponse,
  listSLOsCall,
  listUserJourneysCallResponse,
  getSLORiskCount,
  getSLORiskCountResponse,
  getMonitoredService,
  getMonitoredServiceResponse,
  listMonitoredServicesForSLOs,
  listMonitoredServicesCallResponseForSLOs,
  sloListPostResponseRolling7Days,
  sloListCallResponseWithCompositeSLO,
  getServiceLevelObjectiveV2Response,
  getServiceLevelObjectiveV2,
  getAccountLevelUserJourneysCall,
  accountLevelListSLOsCall,
  accountLevelSLOListResponse,
  createSloV2,
  createCompositeSLOPayload,
  createProjectLevelCompositeSLOPayload
} from '../../../support/85-cv/slos/constants'

describe('Create Composite SLO', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.intercept('GET', listSLOsCall, sloListCallResponseWithCompositeSLO).as('updatedListSLOsCallResponse')
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', getMonitoredService, getMonitoredServiceResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', listMonitoredServicesForSLOs, listMonitoredServicesCallResponseForSLOs)
    cy.intercept('GET', getSLOMetrics, listSLOMetricsCallResponse)

    cy.visitChangeIntelligenceForSLOs()
  })

  it('should show all validations.', () => {
    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create Composite SLO').click()
    cy.contains('span', 'Save').click({ force: true })
    cy.contains('span', 'SLO name is required').should('be.visible')
    cy.contains('span', 'User journey is required').should('be.visible')
    cy.contains('p', 'Set SLO Time Window').click()
    cy.contains('span', 'Period Length is required').should('be.visible')
    cy.contains('p', 'Add SLOs').click()
    cy.contains('p', "Should have minimun 2 SLOs and maximum 20 SLO's").should('be.visible')
  })

  it('should be able to create SLO by filling all the details.', () => {
    cy.intercept('POST', createSloV2).as('saveSLO')
    cy.intercept('POST', listSLOsCall, sloListPostResponseRolling7Days).as('sloListPostResponseRolling7Days')
    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create Composite SLO').click()
    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')

    // selecting user journey
    cy.get('div[data-testid="multiSelectService"]').click()
    cy.contains('label', 'new-one').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    // selecting condition for SLI value
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    cy.contains('span', 'Add SLOs').click()
    cy.get('[type="checkbox"]').first().click({ force: true })
    cy.get('[data-testid="addSloButton"]').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })
    cy.contains('span', 'Save').click({ force: true })
    cy.wait('@saveSLO').then(data => {
      // match the payload to verify we submit correct payload
      cy.debug()
      expect(JSON.stringify({ ...data.request.body })).equal(
        JSON.stringify({ ...createProjectLevelCompositeSLOPayload })
      )
    })
    cy.contains('span', 'Composite SLO created successfully').scrollIntoView().should('be.visible')
  })

  it('should render all the edit steps and update the SLO', () => {
    cy.contains('p', 'SLOs').click()
    cy.intercept('GET', getServiceLevelObjectiveV2, getServiceLevelObjectiveV2Response)
    cy.intercept('POST', listSLOsCall, sloListPostResponseRolling7Days).as('sloListPostResponseRolling7Days')
    cy.wait(1000)
    cy.get('[data-icon="Edit"]').click({ force: true })
    cy.get('[name="name"]').should(
      'have.value',
      getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.name
    )
    cy.get('.MultiSelectDropDown--counter').should('have.text', '01')

    cy.contains('span', 'Next').click({ force: true })

    cy.get('[name="periodType"]').should(
      'have.value',
      getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.sloTarget.type
    )

    cy.get('[name="periodLength"]').should(
      'have.value',
      getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.sloTarget.spec.periodLength.split('')[0]
    )

    cy.contains('span', 'Next').click({ force: true })

    cy.get('[name="weightagePercentage"]')
      .eq(0)
      .should(
        'have.value',
        getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.spec.serviceLevelObjectivesDetails[0].weightagePercentage.toFixed(
          0
        )
      )
    cy.get('[name="weightagePercentage"]')
      .eq(1)
      .should(
        'have.value',
        getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.spec.serviceLevelObjectivesDetails[1].weightagePercentage.toFixed(
          0
        )
      )
    cy.get('[name="weightagePercentage"]')
      .eq(2)
      .should(
        'have.value',
        getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.spec.serviceLevelObjectivesDetails[2].weightagePercentage.toFixed(
          0
        )
      )

    cy.contains('span', 'Next').click({ force: true })

    cy.get('[name="SLOTargetPercentage"]').should(
      'have.value',
      getServiceLevelObjectiveV2Response.resource.serviceLevelObjectiveV2.sloTarget.sloTargetPercentage.toFixed(0)
    )
    cy.findByText('173 mins')

    cy.contains('span', 'Next').click({ force: true })

    // validate preview values
    cy.findByText('Rolling PL 1')
    cy.findByText('Rolling with PeriodLength 1')
    cy.findByText('newone')
    cy.findByText('Rolling')
    cy.findByText('1d')
    cy.findByText('SLO1')
    cy.findByText('SLO3')
    cy.findByText('SLO4')
    cy.findByText('20%')
    cy.findAllByText('40%').should('have.length', 2)
    cy.findByText('88%')

    cy.get('[data-testid="steptitle_Set_SLO_Time_Window"]').click()
    cy.get('input[name="periodType"]').click()
    cy.contains('p', 'Calendar').click({ force: true })
    cy.findByText('Review Period Type Change')
    cy.findByRole('button', { name: /Ok/i }).click()
    cy.get('input[name="periodLengthType"]').click()
    cy.contains('p', 'Weekly').click({ force: true })
    cy.get('input[name="dayOfWeek"]').click()
    cy.contains('p', 'Monday').click({ force: true })
    cy.get('[data-testid="steptitle_Add_SLOs"] [icon="error"]').should('be.visible')
    cy.contains('span', 'Next').click({ force: true })

    cy.contains('span', 'Add SLOs').click()
    cy.get('[type="checkbox"]').first().click({ force: true })
    cy.get('[data-testid="addSloButton"]').click({ force: true })
    cy.get('[name="weightagePercentage"]').eq(0).should('have.value', '33.3')
    cy.get('[name="weightagePercentage"]').eq(1).should('have.value', '33.3')
    cy.get('[name="weightagePercentage"]').eq(2).should('have.value', '33.4')
    cy.contains('span', 'Cancel').click({ force: true })
    cy.findByText('Unsaved changes')
    cy.get('.bp3-dialog')
      .findByRole('button', { name: /Cancel/i })
      .click()
    cy.contains('span', 'Save').click({ force: true })
    cy.get('.bp3-dialog').findByRole('button', { name: /Ok/i }).click()
  })
})

describe('Create account level SLO', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')
    cy.visitPageAssertion('[class^=SideNav-module_main]')
    cy.contains('span', 'Service Reliability').click()
    cy.intercept('GET', getAccountLevelUserJourneysCall, listUserJourneysCallResponse)
  })
  it('should be able to create SLO by filling all the details.', () => {
    cy.intercept('POST', accountLevelListSLOsCall, accountLevelSLOListResponse).as('sloListPostResponseRolling7Days')
    cy.intercept('POST', createSloV2).as('saveSLO')
    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create Composite SLO').click()
    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')
    // selecting user journey
    cy.get('div[data-testid="multiSelectService"]').click()
    cy.contains('label', 'new-one').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    // selecting condition for SLI value
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    cy.contains('span', 'Add SLOs').click()
    cy.wait(1000)
    cy.findAllByRole('checkbox').eq(1).click({ force: true })
    cy.findAllByRole('checkbox').eq(1).should('be.checked')
    cy.findAllByRole('checkbox').eq(2).should('not.be.checked')
    cy.findAllByRole('checkbox').eq(2).click({ force: true })
    cy.findAllByRole('checkbox').eq(2).should('be.checked')
    cy.findAllByRole('checkbox').eq(1).should('be.checked')
    cy.findAllByRole('checkbox').eq(1).click({ force: true })
    cy.findAllByRole('checkbox').eq(2).should('be.checked')
    cy.findAllByRole('checkbox').eq(1).should('not.be.checked')
    cy.findAllByRole('checkbox').eq(1).click({ force: true })
    cy.get('[data-testid="addSloButton"]').click({ force: true })
    cy.wait(1000)

    cy.contains('span', 'Add SLOs').click()
    cy.wait('@sloListPostResponseRolling7Days')
    cy.wait(1000)
    cy.findAllByRole('checkbox').eq(1).should('be.checked')
    cy.findAllByRole('checkbox').eq(2).should('be.checked')
    cy.get('[data-testid="addSloButton"]').click({ force: true })

    cy.get('[data-icon="main-trash"]').eq(1).click()
    cy.wait(1000)
    cy.get('.bp3-dialog')
      .findByRole('button', { name: /delete/i })
      .click()
    cy.contains('p', 'demo_composite_slo').should('not.exist')
    cy.contains('span', 'Add SLOs').click()
    cy.wait('@sloListPostResponseRolling7Days')
    cy.findAllByRole('checkbox').eq(2).click({ force: true })
    cy.get('[data-testid="addSloButton"]').click({ force: true })
    cy.contains('span', 'Next').click({ force: true })
    cy.contains('span', 'Save').click({ force: true })

    cy.wait('@saveSLO').then(data => {
      // match the payload to verify we submit correct payload
      cy.debug()
      expect(JSON.stringify({ ...data.request.body })).equal(JSON.stringify({ ...createCompositeSLOPayload }))
    })
  })
})
