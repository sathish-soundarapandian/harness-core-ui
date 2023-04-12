/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState  } from 'react'
import { Text, Icon, Layout, ButtonVariation, ButtonSize } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import cdOnboardingSteps from '../home/images/cd-onboarding-steps.svg'
import css from './TweetyChatPage.module.scss'
import { TextInput }  from '@harness/uicore'
import { left } from '@popperjs/core'
import axios from 'axios';
import styled from 'styled-components';
import { Page } from '@common/exports'
import { HarnessDocTooltip } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import TextField from '@mui/material/TextField';

export default function TweetyChatPage(): React.ReactElement {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { getString } = useStrings()

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    const response = await axios.post('http://127.0.0.1:5002/ask', { 'message': message }, { headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" } });
    setChat(oldChat => oldChat.concat([{ message, sender: 'user' }, {message: response.data.msg.response.replace(/\n/g,  "<br/>").replace(/ /g, "\u00A0"), sender: "chatbot"}]))
    // setChat([...chat, { message, sender: 'user' }, { message: response.data.response, sender: 'chatbot' }]);
    setMessage('');
  };

  return (
    <div className={css.main}>
    <Container>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id={'deploymentsText'}>{getString('tweety')}</h2>
            <HarnessDocTooltip tooltipId={'deploymentsText'} useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />
        <ChatWindow>
          {chat.map((item, index) => (
            <ChatMessage key={index} sender={item.sender}>
              <div dangerouslySetInnerHTML={{__html:item.message}}>
                </div>
            </ChatMessage>
          ))}
        </ChatWindow>
        <InputContainer>
        <Input wrapperClassName={css.search} autoFocus type="text" value={message} placeholder={getString('askMeAnything')} onChange={handleInputChange} />
          <RbacButton
            width={"70px"}
            padding={{ left:'small', bottom: 'small', top: 'small', right: 'large'}}
            margin={{ left: 'xlarge' }}
            variation={ButtonVariation.PRIMARY}
            size={ButtonSize.MEDIUM}
            text={'Ask'}
            rightIcon="chevron-right"
            onClick={handleSendMessage}
            permission={{
              permission: PermissionIdentifier.EDIT_PIPELINE,
              resource: {
                resourceType: ResourceType.PIPELINE
              }
            }}
                  />
        </InputContainer>
      </Container>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const ChatWindow = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ChatMessage = styled.div`
  background-color: ${(props) => (props.sender === 'user' ? '#4CAF50' : '#2a578c')};
  color: #fff;
  max-width: 50%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: ${(props) => (props.sender === 'user' ? '10px 10px 0 10px' : '10px 10px 10px 0')};
  align-self: ${(props) => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  margin-left: ${(props) => (props.sender === 'user' ? 'auto' : 0)}; 
  margin-right: ${(props) => (props.sender === 'user' ? 0 : 'auto')}; 
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f1f1f1;
  padding: 10px;
`;

const Input = styled.input`
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 10px;
  margin-right: 10px;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #2196f3;
  color: #fff;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

