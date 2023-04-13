/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Icon, Layout, Button, ButtonVariation, ButtonSize, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './TweetyChatPageDrawer.module.scss'
import styled from 'styled-components'
import { Drawer } from '@blueprintjs/core'
import axios from 'axios';
import { Position } from 'vscode-languageserver-types'

export default function TweetyChatPageDrawer(): React.ReactElement {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { getString } = useStrings()
  const [show, setShow] = useState<boolean>(true)
  const KEY_CODE_FOR_ENTER_KEY = 13

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    console.log("Got event")
    if (message.length != 0) {
      const response = await axios.post('http://127.0.0.1:5002/ask', { 'message': message }, { headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" } });
      setChat(oldChat => oldChat.concat([{ message, sender: 'user' }, { message: response.data.msg.response.replace(/\n/g, "<br/>").replace(/ /g, "\u00A0"), sender: "chatbot" }]))
      // setChat([...chat, { message, sender: 'user' }, { message: "hello", sender: 'chatbot' }]);
    }
    // const response = await axios.post('http://localhost:5000', { message }, { headers: { 'Content-Type': 'text/plain'} });
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
        <Layout.Vertical>
          <Layout.Horizontal
            padding={{ bottom: 'medium', top: 'medium', left: 'small' }}
            // className={css.title}
            flex={{ justifyContent: 'flex-start' }}
          // size={30}
          >
            <Icon
              name='chevron-left'
              // variation={ButtonVariation.ICON}
              size={30}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                setShow(false)
              }}
            />
            <Text color={Color.WHITE} style={{ fontSize: 22, fontWeight: 'bold', paddingTop: "5px", paddingLeft: "5px" }}>Tweety</Text>
            <Icon name="canary" size={30} style={{ paddingTop: "5px", paddingLeft: "5px" }} />

          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical>
          <Text style={{ fontSize: 12, paddingLeft: "40px", color: "#F2E7D5" }}>AI Bot to help you Harness related</Text>
        </Layout.Vertical>
        <Layout.Vertical>
          <div className={css.div}>
            <ChatWindow>
              {chat.map((item, index) => (
                <ChatMessage key={index} sender={item.sender}>
                  <div dangerouslySetInnerHTML={{ __html: item.message }}>
                  </div>
                </ChatMessage>
              ))}
            </ChatWindow>
          </div>
        </Layout.Vertical>
        <Layout.Vertical>
          <InputContainer>
            <Input wrapperClassName={css.search} autoFocus
              style={{ marginRight: "5px" }}
              type="text" value={message} placeholder={getString('askMeAnything')} onChange={handleInputChange} />
            <Icon
              // width={"70px"}
              // padding={{ left: 'small', bottom: 'small', top: 'small', right: 'large' }}
              // margin={{ left: '-70px !important' }}
              // variation={ButtonVariation.PRIMARY}
              size={30}
              color="blue500"
              style={{ marginLeft: "-50px", marginRight: "25px" }}
              // text={'Ask'}
              name="arrow-right"
              onClick={handleSendMessage}
              className="submit-button"
            />
          </InputContainer>
        </Layout.Vertical>
      </Layout.Vertical>
    </Drawer >
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
  margin-bottom: 30px;
`;

const ChatMessage = styled.div`
  background-color: ${(props) => (props.sender === 'user' ? '#007AFF' : '#1B2E49')};
  color: #fff;
  max-width: 95%;
  min-width: 40%;
  width: fit-content;
  padding: 10px;
  margin-bottom: 10px;
  overflow-wrap: anywhere;
  border-radius: ${(props) => (props.sender === 'user' ? '25px 0px 25px 25px' : '16px 16px 16px 0px')};
  align-self: ${(props) => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  margin-left: ${(props) => (props.sender === 'user' ? 'auto' : 0)}; 
  margin-right: ${(props) => (props.sender === 'user' ? 0 : 'auto')}; 
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #081B32;
  padding: 10px;
  position: fixed;
  bottom: 20px;
  width: 520px;
`;

const Input = styled.input`
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 10px;
  border-radius: 100px;
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

