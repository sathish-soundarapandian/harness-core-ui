/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState  } from 'react'
import { Text, Icon, Layout, Button, ButtonVariation, ButtonSize, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './TweetyChatPageDrawer.module.scss'
import styled from 'styled-components'
import { Drawer } from '@blueprintjs/core'
import { Position } from 'vscode-languageserver-types'

export default function TweetyChatPageDrawer(): React.ReactElement {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { getString } = useStrings()
  const [show, setShow] = useState<boolean>(true)

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    // const response = await axios.post('http://localhost:5000', { message }, { headers: { 'Content-Type': 'text/plain'} });
    const response = "hello"
    setChat([...chat, { message, sender: 'user' }, { message: message, sender: 'chatbot' }]);
    setMessage('');
  };

  return (
    <Drawer
      autoFocus
      enforceFocus
      hasBackdrop
      usePortal
      canOutsideClickClose
      canEscapeKeyClose
      position={Position.LEFT}
      isOpen={show}
      onClose={() => {
        setShow(false)
      }}
      className={css.resourceCenter}
    >
    <Layout.Vertical>
      <Layout.Horizontal
            padding={{ bottom: 'medium' }}
            className={css.title}
            flex={{ alignItems: 'baseline' }}
          >
            <Button
              icon={'arrow-left'}
              variation={ButtonVariation.ICON}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                setShow(false)
              }}
            />
            <Text color={Color.WHITE}>Tweety</Text>
            <Icon name="canary" size={24}/>

          </Layout.Horizontal>
      <Layout.Vertical>
      <ChatWindow>
        {chat.map((item, index) => (
          <ChatMessage key={index} sender={item.sender}>
            {item.message}
          </ChatMessage>
        ))}
      </ChatWindow>
      </Layout.Vertical>
      <Layout.Vertical>
      <InputContainer>
      <Input wrapperClassName={css.search} autoFocus type="text" value={message} placeholder={getString('askMeAnything')} onChange={handleInputChange} />
        <RbacButton
          width={"70px"}
          padding={{ left:'small', bottom: 'small', top: 'small', right: 'large'}}
          margin={{ left: 'xlarge', bottom: '0'}}
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
      </Layout.Vertical>
    </Layout.Vertical>
    </Drawer>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const ChatWindow = styled.div`
  height: 520px
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

// const Button = styled.button`
//   background-color: #2196f3;
//   color: #fff;
//   border: none;
//   outline: none;
//   font-size: 16px;
//   padding: 10px 20px;
//   border-radius: 5px;
//   cursor: pointer;
// `;

