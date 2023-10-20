import { HubConnection } from "@microsoft/signalr";
import { chat, fileMessage, message, userFromDb } from "../pages/ChatPage";
import { useEffect, useState } from "react";
import checkIfChatIsTheSameAsUserMessagingWith from "../functions/checkIfChatIsTheSameAsUserMessagingWith";
import createChatNameWithChat from "../functions/createChatNameWithChat";
import getMessages from "../functions/getMessages";
import { useAuth0 } from "@auth0/auth0-react";
import sendFiles, { base64StringToArrayBuffer } from "../functions/sendFiles";
import stringToBase64String from "../functions/stringToBase64String";
import "../icons.css";
import "../css/profileImage.css";

interface ChatWithUser {
    user: userFromDb | null,
    thisUserFromDb: userFromDb,
    chat: chat | null,
    websocket: HubConnection | null,
}

export function sendMessageForFirstTime(content: string, type: string, websocket: HubConnection | null, user: userFromDb | null) {
    if (user != null) {
        console.log("Other user is not null");
        websocket?.invoke("SendFirstMessageToUser", user.Id, content, type);
    }
}

export function trySendMessage(content: string, type: string, websocket: HubConnection | null, chat: chat | null) {
    if (chat != null) {
        console.log("sending message");
        websocket?.invoke("SendMessage", chat.Id, content, type);
    }
}

export default function ChatWithUser({user, thisUserFromDb, chat, websocket}: ChatWithUser) {
    //const [thisUser, setThisUser] = useState<userFromDb>(thisUserFromDb);
    const { getAccessTokenSilently } = useAuth0();

    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Array<message | fileMessage>>([]);
    const [chatName, setChatName] = useState<string | null>(null);
    const [chatInfoActive, setChatInfoActive] = useState(false);

    function setMessagesContainer(value: Array<message | fileMessage>) {
        setMessages(value);
    }
    
    function assignWebsocketsHandlers(wc : HubConnection | null) {
        if (wc != null) {
            wc.on("RecieveMessageForFirstTime", function (chatString: string, messageString: string) {
                const chat : chat = JSON.parse(chatString);
                const message : message = JSON.parse(messageString);

                if (checkIfChatIsTheSameAsUserMessagingWith(chat, user)) {
                    updateMessagesWithFileMessages(messages, setMessagesContainer, [message]);
                    //setMessages([...messages, message]);
                }
            });

            wc.on("RecieveMessage", function (chatString: string, messageString: string) {
                const message : message = JSON.parse(messageString);
                const returnedChat : chat = JSON.parse(chatString);

                console.log(chat);
                console.log(user);

                if (chat && chat.Id == returnedChat.Id) {
                    updateMessagesWithFileMessages(messages, setMessagesContainer, [message]);
                    //setMessages([...messages, message]);
                }
            });
        }
    }

    async function getMessagesContainer() {
        if (chat) {
            const newMessages = await getMessages(chat.Id, getAccessTokenSilently);
            if (newMessages) {
                updateMessagesWithFileMessages([], setMessagesContainer, newMessages);
                //setMessages(newMessages);
            }
        }
    }

    useEffect(() => {
        assignWebsocketsHandlers(websocket);
        getMessagesContainer();

        if (chat) {
            setChatName(createChatNameWithChat(chat, thisUserFromDb).name);
        } else if (user) {
            setChatName(user.Name);
        }
    }, [])

    useEffect(() => {
        getMessagesContainer();
    }, [chat]);

    useEffect(() => {
        assignWebsocketsHandlers(websocket);
    }, [user, chat, messages, websocket]);

    function updateMessagesWithFileMessages(mainArr: Array<message | fileMessage>, setMainArrContainer: (value: Array<message | fileMessage>) => void, arrToAdd: Array<message | fileMessage>) {
        setMainArrContainer([...mainArr, ...arrToAdd]);

        let mainArrCopy = mainArr;

        for (let index = 0; index < arrToAdd.length; index++) {
            const element = arrToAdd[index];
            
            if (instanceOfMessage(element) && element.Type != "PlainText") {
                const typeInfo = element.Type.split(".-.");

                /*const blob = new Blob([
                    element.Content
                  ], {type: typeInfo[2]});*/

                  //const blob = atob(element.Content);
                  console.log(new TextEncoder().encode(element.Content));
                  const blob = new Blob([
                        base64StringToArrayBuffer(element.Content)
                    ], {type: typeInfo[2]});

                const newFileMessage: fileMessage = {ContentBlob: blob, FileName: typeInfo[1], Chat: element.Chat, ChatId: element.ChatId, UserIdWhoSend: element.UserIdWhoSend, UserWhoSend: element.UserWhoSend, DateTime: element.DateTime, Id: element.Id};

                arrToAdd[index] = newFileMessage;
            } else if (instanceOfMessage(element)) {
                const newMessage: message = {...element, Content: decodeURIComponent(atob(element.Content))};

                arrToAdd[index] = newMessage;
            }
        }

        mainArrCopy = [...mainArrCopy, ...arrToAdd];

        console.log(mainArrCopy);

        //setMainArrContainer
        setMainArrContainer(mainArrCopy);
    }
    /*useEffect(() => {
        if (websocket != null) {
            websocket.on("RecieveMessageForFirstTime", function (chatString: string, messageString: string) {
                console.log(`chat: ${chatString}`);
                console.log(`message: ${messageString}`);

                const message : message = JSON.parse(messageString);
                const returnedChat : chat = JSON.parse(chatString);

                if (user && returnedChat.Users?.length == 2) {
                    returnedChat.Users?.forEach(element => {
                        if (element.Id == user.Id) {
                            setMessages([...messages, message]);
                        }
                    });
                }
            });

            websocket.on("RecieveMessage", function (chatString: string, messageString: string) {
                const message : message = JSON.parse(messageString);
                const returnedChat : chat = JSON.parse(chatString);

                if (chat && chat.Id == returnedChat.Id) {
                    setMessages([...messages, message]);
                }
            });
        }
    }, [websocket]);*/

    function sendTextMessage(content: string) {
        if (websocket != null && websocket.state == "Connected") {
            if (chat != null) {
                console.log("Chat is not null");
                console.log(chat);
                trySendMessage(stringToBase64String(content), "PlainText", websocket, chat);
                setMessageText("");
            } else {
                console.log("Chat is null");
                sendMessageForFirstTime(stringToBase64String(content), "PlainText", websocket, user);
                setMessageText("");
            }
        }
    }

    function mapMessage(message: fileMessage | message, index: number, thisUserId: string) {
        if (instanceOfMessage(message) && message.Type == "PlainText") {
            if (thisUserId == message.UserIdWhoSend) {
                return <p key={index} className="this-user-message">{message.Content}</p>;
            } else {
                return <p key={index} className="other-user-message">{message.Content}</p>;
            }
        } else if (instanceOfFileMessage(message) && message.ContentBlob) {
            if (thisUserId == message.UserIdWhoSend) {
                return <a href={window.URL.createObjectURL(message.ContentBlob)} download={message.FileName} key={index} className="this-user-message">{message.FileName}</a>;
            } else {
                return <a href={window.URL.createObjectURL(message.ContentBlob)} download={message.FileName} key={index} className="other-user-message">{message.FileName}</a>;
            }
        }
        return <p>Loading or error</p>;
    }

    function mapMessages(messages: Array<message | fileMessage>, thisUserId: string) {
        const mappedMessages = messages.map((message, index) => 
            mapMessage(message, index, thisUserId)
        );

        console.log(messages);
        console.log(mappedMessages);
        console.log([mappedMessages[mappedMessages.length - 1]]);

        return mappedMessages;
    }

    function instanceOfMessage(object: any): object is message {
        return true;
    }

    function instanceOfFileMessage(object: any): object is fileMessage {
        return true;
    }

    if (!chatInfoActive) {
        return <div id="chat-box">
            <div id="chat-box-user-header"><p id="chat-box-user-header-p"><div onClick={() => setChatInfoActive(true)}>{chatName}</div></p></div>
            <div id="chat-box-message-box">
                {[...mapMessages(messages, thisUserFromDb.Id)]}
            </div>
            <div id="chat-box-input-box">
                <input id="chat-box-input" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                <button id="chat-box-button" onClick={() => sendTextMessage(messageText)}>Send</button>
                <input id="chat-box-file-input" type="file" onChange={(e) => sendFiles(e, websocket, chat, user)}/>
            </div>
        </div>
    } else {
        if (chat?.Users?.length == 2 || user) {
            let userInfo;
            if (chat) {
                chat.Users?.forEach(element => {
                    if (element.Id != thisUserFromDb.Id) {
                        userInfo = element;
                    }
                });
            }
            if (user) {
                userInfo = user;
            }

            if (userInfo) {
                console.log("hoh");
                return <div id="chat-box">
                    <div id="menu-box">
                        <div className="gg-close-o" onClick={() => setChatInfoActive(false)} />
                        <img className="profile-image" src={userInfo.Picture ? userInfo.Picture : undefined} />
                        <p>Name: {userInfo.Name}</p>
                        <p>Id: {userInfo.Id}</p>
                    </div>
                </div>
            }
        }
        return <div id="chat-box">
            <div id="menu-box">
                <div className="gg-close-o" onClick={() => setChatInfoActive(false)} />
            </div>
        </div>;
    }
}