import React, { useState, useEffect } from 'react';
import {
  RSocketClient,
  JsonSerializer,
  IdentitySerializer,
  encodeRoute,
} from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { EchoResponder } from './responder';

const Chatting = () => {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chattingAddress, setChattingAddress] = useState('');

  const messageReceiver = (payload) => {
    setMessages((prevMessages) => [...prevMessages, payload.data]);
  };

  const responder = new EchoResponder(messageReceiver);

  const send = () => {
    socket
      .requestResponse({
        data: {
          username: 'username',
          message: message,
          chattingAddress : chattingAddress,
        },
        metadata: String.fromCharCode('message'.length) + 'message',
      })
      .subscribe({
        onComplete: (com) => {
          console.log('com : ', com);
        },
        onError: (error) => {
          console.log(error);
        },
        onNext: (payload) => {
          console.log(payload.data);
        },
        onSubscribe: (cancel) => {
          console.log(cancel);
        },
      });
  };

  const connect = (chattingAddress)=> {
    const client = new RSocketClient({
        serializers: {
            data: JsonSerializer,
            metadata: IdentitySerializer,
        },
        setup: {
            payload: {
                data: chattingAddress
            },
            keepAlive: 60000,
            lifetime: 180000,
            dataMimeType: 'application/json',
            metadataMimeType: 'message/x.rsocket.routing.v0',
        },
        responder:responder,
        transport: new RSocketWebSocketClient({
            url: 'ws://localhost:6565/rs',
        })
    });
    
    client.connect().subscribe({
        onComplete : (socket)=>{
            console.log('Connection Success')
            setSocket(socket);
        },
        onError : (error) =>{
            console.log('e : ',error)
        },
        onSubscribe: (cancel) => {
          console.log(cancel);
        },
    });
};


  return (
    <div>
      <h1>Chatting</h1>
      <input 
        type="text" 
        value={chattingAddress}
        onChange={(e)=> setChattingAddress(e.target.value)}
        placeholder="채팅방 번호"
        ></input>
      <button onClick={() => connect(chattingAddress)}>연결</button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지 입력"
      />
      <button onClick={send}>전송</button>
      <ul>
        {messages.map((item, index) => (
          <li key={index}>{item.username} : {item.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Chatting;
