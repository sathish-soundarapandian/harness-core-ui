/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Container, Text, Icon, Heading } from '@harness/uicore'
import React, { ReactElement, useState } from 'react'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import idleTimeIMG from './images/idleTime.svg'
import spotVSODIMG from './images/spotOD.svg'
import ssh from './images/ssh.svg'
// import rdp from './images/rdp.svg'
// import bgTasks from './images/bgTasks.svg'
// import ip from './images/ip.svg'
import dnsLink from './images/dnsLink.svg'
import providerSelector from './images/providerSelector.svg'

interface COHelpSidebarProps {
  pageName: string
  activeSectionNames: string[]
  customDomain?: string
  hostName?: string
  showSshOption?: boolean
}

const ConfigStepOneContent = () => {
  const { getString } = useStrings()
  return (
    <>
      <Text style={{ fontWeight: 500, fontSize: 'var(--font-size-normal)', lineHeight: '24px' }}>
        <Icon name="info"></Icon> {getString('ce.co.autoStoppingRule.helpText.step1.title')}
      </Text>
      <Container flex style={{ justifyContent: 'center', flexGrow: 1 }}>
        <img src={idleTimeIMG} alt="" aria-hidden />
      </Container>
      <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
        {getString('ce.co.autoStoppingRule.helpText.step1.description')}
      </Text>
      {/* <Text style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}>
        {getString('ce.co.autoStoppingRule.helpText.readMore')}
      </Text> */}
    </>
  )
}

const ConfigStepTwoContent = () => {
  const { getString } = useStrings()
  return (
    <>
      <Text style={{ fontWeight: 500, fontSize: 'var(--font-size-normal)', lineHeight: '24px' }}>
        <Icon name="info"></Icon> {getString('ce.co.autoStoppingRule.helpText.step2.title')}
      </Text>
      <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
        {getString('ce.co.autoStoppingRule.helpText.step2.description.heading')}
      </Text>
    </>
  )
}

const ConfigStepThreeContent = () => {
  const { getString } = useStrings()
  return (
    <>
      <Text style={{ fontWeight: 500, fontSize: 'var(--font-size-normal)', lineHeight: '24px' }}>
        <Icon name="info"></Icon> {getString('ce.co.autoStoppingRule.helpText.step3.title')}
      </Text>
      <img src={spotVSODIMG} alt="" aria-hidden />
      <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
        {getString('ce.co.autoStoppingRule.helpText.step3.description.info')}
        <br />
        <br />
        {getString('ce.co.autoStoppingRule.helpText.step3.description.additionalInfo')}
      </Text>
    </>
  )
}

const configStepIdToContentMap: { [key: string]: ReactElement } = {
  configStep1: <ConfigStepOneContent />,
  configStep2: <ConfigStepTwoContent />,
  configStep3: <ConfigStepThreeContent />
}

const COHelpSidebar: React.FC<COHelpSidebarProps> = props => {
  const [activeSections] = useState<string[]>(props.activeSectionNames)
  const { getString } = useStrings()
  return (
    <Container>
      {props.pageName == 'configuration' && props.activeSectionNames && (
        <Container padding="large">
          <Layout.Vertical padding="medium" spacing="large">
            {props.activeSectionNames.map(_id => {
              return configStepIdToContentMap[_id]
            })}
          </Layout.Vertical>
        </Container>
      )}
      {props.pageName == 'setup-access' ? (
        <Container padding="large">
          <Layout.Vertical padding="medium" spacing="xxlarge">
            <Layout.Horizontal spacing="large" padding="medium">
              <img src={dnsLink} alt="" aria-hidden />
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.info')}
              </Text>
            </Layout.Horizontal>
            {props.showSshOption === true && (
              <Layout.Horizontal spacing="large" padding="medium">
                <img src={ssh} alt="" aria-hidden />
                <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                  {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.info')}
                </Text>
              </Layout.Horizontal>
            )}
          </Layout.Vertical>
        </Container>
      ) : null}
      {props.pageName == 'setup-access-dns' ? (
        <>
          <Container padding="large" background={Color.BLUE_200}>
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Layout.Horizontal spacing="large" padding="medium">
                <img src={dnsLink} alt="" aria-hidden />
                <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                  {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.info')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          <Container padding="xsmall">
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.title')}
              </Text>
              <Layout.Horizontal spacing="large">
                <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                  <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step1.title')}
                  </Text>
                  <Text style={{ lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step1.description')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="large">
                <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                  <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step2.title')}
                  </Text>
                  <Text style={{ lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step2.description')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              {activeSections.includes('usingCustomDomain') ? (
                <Layout.Horizontal spacing="large">
                  <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                  <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                    <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                      {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step3.title')}
                    </Text>
                    <Text style={{ lineHeight: '20px' }}>
                      {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.step3.description')}
                    </Text>
                    {activeSections.includes('dns-others') ? (
                      <>
                        <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                          {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.title')}
                        </Text>
                        <Text style={{ lineHeight: '20px' }}>
                          {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.description')}
                        </Text>
                        <ol style={{ padding: 'var(--spacing-medium)', lineHeight: '45px' }}>
                          <li>
                            <Text style={{ lineHeight: '20px' }}>
                              {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step1', {
                                customDomain: props.customDomain
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step2', {
                                hostName: props.hostName
                              })}
                            </Text>
                          </li>
                        </ol>
                        <Container padding="large" background={Color.BLUE_200}>
                          <Layout.Vertical spacing="medium">
                            <Text>{props.customDomain} CNAME </Text>
                            <Text>{props.hostName}</Text>
                          </Layout.Vertical>
                        </Container>
                        <ol start={3} style={{ padding: 'var(--spacing-medium)', lineHeight: '45px' }}>
                          <li>
                            <Text style={{ lineHeight: '20px' }}>
                              {getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step3', {
                                customDomain: props.customDomain
                              })}
                            </Text>
                          </li>
                        </ol>
                      </>
                    ) : null}
                  </Layout.Vertical>
                </Layout.Horizontal>
              ) : null}
              {/* <Text
                style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
              >
                {getString('ce.co.autoStoppingRule.helpText.readMore')}
              </Text> */}
            </Layout.Vertical>
          </Container>
        </>
      ) : null}
      {props.pageName == 'setup-access-ssh' ? (
        <>
          <Container padding="large" background={Color.BLUE_200}>
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Layout.Horizontal spacing="large" padding="medium">
                <img src={ssh} alt="" aria-hidden />
                <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                  {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.info')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Container>
          <Container padding="large">
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
                {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.title')}
              </Text>
              <Layout.Horizontal spacing="large">
                <Icon name="info-sign" size={23} color={Color.BLUE_500}></Icon>
                <Layout.Vertical spacing="small" style={{ maxWidth: '80%' }}>
                  <Text style={{ fontWeight: 'bold', lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.download')}
                  </Text>
                  <Text style={{ lineHeight: '20px' }}>
                    {getString('ce.co.autoStoppingRule.setupAccess.helpText.ssh.setup.description')}
                  </Text>
                </Layout.Vertical>
              </Layout.Horizontal>
              {/* <Text
                style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
              >
                {getString('ce.co.autoStoppingRule.helpText.readMore')}
              </Text> */}
            </Layout.Vertical>
          </Container>
        </>
      ) : null}
      {props.pageName == 'provider-selector' ? (
        <>
          <Container padding="large">
            <Layout.Vertical padding="medium" spacing="xxlarge">
              <Heading level={2}>{'Select Cloud Account'}</Heading>
              <img
                src={providerSelector}
                alt=""
                aria-hidden
                style={{
                  width: '50%',
                  alignSelf: 'center'
                }}
              />
              <Text>{getString('ce.co.autoStoppingRule.providerSelector.helpText.selectProvider')}</Text>
              {/* <Text
                style={{ color: '#0278d5', fontSize: 'var(--font-size-normal)', fontWeight: 500, lineHeight: '24px' }}
              >
                {getString('ce.co.autoStoppingRule.helpText.readMore')}
              </Text> */}
            </Layout.Vertical>
          </Container>
        </>
      ) : null}
    </Container>
  )
}

export default COHelpSidebar
