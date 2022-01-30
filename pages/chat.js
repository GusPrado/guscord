import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

import appConfig from '../config.json';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPBASE_ANON_KEY
);

export default function ChatPage() {
  const router = useRouter();
  const loggedUser = router.query.username;
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  function listenRealTimeMessages(addMessage) {
    return supabaseClient
      .from('messages')
      .on('INSERT', (response) => {
        addMessage(response.new);
      })
      .subscribe();
  }

  useEffect(() => {
    supabaseClient
      .from('messages')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        console.log('mesgs', data);
        setMessageList(data);
      });

    listenRealTimeMessages((newMessage) => {
      setMessageList((actualListContent) => {
        return [newMessage, ...actualListContent];
      });
    });
  }, []);

  function handleNewMessage(newMessage) {
    const message = {
      // id: messageList.length,
      from: loggedUser,
      text: newMessage,
    };

    supabaseClient
      .from('messages')
      .insert([message])
      .then(({ data }) => {
        console.log('criando nova mesg', data);
      });

    setMessage('');
  }

  return (
    <Box
      styleSheet={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/07/star-wars-imperial-star-destroyer-bridge.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000'],
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '80%',
          maxHeight: '90vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >
          <MessageList messages={messageList} />
          {/* {messageList} */}

          <Box
            as='form'
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              value={message}
              onChange={(e) => {
                const value = e.target.value;
                setMessage(value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNewMessage(e.target.value);
                }
              }}
              placeholder='Insira sua mensagem aqui...'
              type='textarea'
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                // console.log('[USANDO O COMPONENTE]: Salva no banco', sticker)
                handleNewMessage(`:sticker: ${sticker}`);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: '100%',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text variant='heading5'>Chat</Text>
        <Button
          variant='tertiary'
          colorVariant='neutral'
          label='Logout'
          href='/'
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  // console.log('MessageList', props);
  return (
    <Box
      tag='ul'
      styleSheet={{
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals['000'],
        marginBottom: '16px',
      }}
    >
      {props.messages.map((message) => {
        return (
          <Text
            key={message.id}
            tag='li'
            styleSheet={{
              borderRadius: '5px',
              padding: '6px',
              marginBottom: '12px',
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: '8px',
              }}
            >
              <Image
                styleSheet={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '8px',
                }}
                src={`https://github.com/${message.from}.png`}
              />
              <Text tag='strong'>{message.from}</Text>
              <Text
                styleSheet={{
                  fontSize: '10px',
                  marginLeft: '8px',
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag='span'
              >
                {new Date().toLocaleString()}
              </Text>
            </Box>
            {message.text.startsWith(':sticker:') ? (
              <Image
                src={message.text.replace(':sticker:', '')}
                styleSheet={{ width: '30%' }}
              />
            ) : (
              message.text
            )}
          </Text>
        );
      })}
    </Box>
  );
}
