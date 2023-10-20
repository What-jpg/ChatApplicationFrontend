import { useAuth0 } from "@auth0/auth0-react";
import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { HubConnection} from "@microsoft/signalr/dist/esm/HubConnection";
import axios from "axios";
import { env } from "process";
import { useEffect, useState } from "react";
import ChatWithUser from "../components/ChatWithUser";
import checkIfChatIsTheSameAsUserMessagingWith from "../functions/checkIfChatIsTheSameAsUserMessagingWith";
import createChatNameWithChat from "../functions/createChatNameWithChat";
import getChats from "../functions/getChats";
import { NavLink } from "react-router-dom";
import "../icons.css";
import "../css/menu.css";
import MenuContainer from "../components/MenuContainer";

export interface userSearch {
    Id: string,
    Name: string
}

export interface userFromDb {
    Id: string,
    Name: string,
    Picture: null | string
    Chats: null | Array<chat>
}

export interface message {
    Id: number,
    Content: string,
    Type: string,
    UserIdWhoSend: string,
    UserWhoSend: userFromDb | null,
    DateTime: Date,
    ChatId: number,
    Chat: chat | null
}

export interface fileMessage {
    Id: number,
    ContentBlob: Blob,
    FileName: string,
    UserIdWhoSend: string,
    UserWhoSend: userFromDb | null,
    DateTime: Date,
    ChatId: number,
    Chat: chat | null
}

export interface chat {
    Id: number,
    Users: null | Array<userFromDb>;
}

export default function ChatPage() {
    const { getAccessTokenSilently, loginWithRedirect, logout } = useAuth0();

    const [websocketsConnection, setWebsocketsConnection] = useState<HubConnection | null>(null);
    const [userSearchArray, setUserSearchArray] = useState<Array<userSearch>>([]);
    const [shouldDisplayUserSearchResults, setShouldDisplayUserSearchResults] = useState(false);
    const [searchElementHovered, setSearchElementHovered] = useState<number | null>(null);
    const [currentUserMessagingWith, setCurrentUserMessagingWith] = useState<null | userFromDb>(null);
    const [searchInput, setSearchInput] = useState<string>("");
    const [thisUser, setThisUser] = useState<userFromDb | null>(null);
    const [currentChat, setCurrentChat] = useState<chat | null>(null);
    const [chats, setChats] = useState<Array<chat>>([]);
    const [whatIsActive, setWhatIsActive] = useState(false);
    //const [checkLastMessage, setCheckLastMessage] = useState<Array<message | fileMessage> | null>(null);

    const apiServerUrl = process.env.REACT_APP_API_SERVER_URL;
    
    async function getConnectionToWebSokets(token : string) {
        const connection = new HubConnectionBuilder()
            //.configureLogging(LogLevel.Debug)
            .withUrl(apiServerUrl + "/hubs/chathub", {accessTokenFactory: () => token, skipNegotiation: true, transport: HttpTransportType.WebSockets})
            .build();

        return connection;
    }

    useEffect( () => {
        async function checkRedirect() {
            let token;
            
            try {
                token = await getAccessTokenSilently();
            } catch (error) {
                token = undefined;
            }

            const redirectionUrl = window.location.pathname;// + "chat";

            if (!token) {
                loginWithRedirect({
                appState: {
                    returnTo: redirectionUrl
                }
                })
            }
        }
        async function setConnection() {
            const token = await getAccessTokenSilently();

            console.log(token);
            try {
                const response = await axios({
                    url: `${apiServerUrl}/auth/setorgetuser`,
                    method: 'GET',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                });
                setThisUser(response.data);
            } catch (error) {
                if(axios.isAxiosError(error)) {
                    console.log(error.message);
                } else {
                    console.log(error);
                }
            }

            setWebsocketsConnection(await getConnectionToWebSokets(token));
        }
        
        checkRedirect();
        setConnection();
    }, []);

    function assignWebsocketsHandlers(wc : HubConnection | null) {
        if (wc != null) {
            wc.on("RecieveMessageForFirstTime", function (chatString: string, messageString: string) {
                const chat : chat = JSON.parse(chatString);
                const message : message = JSON.parse(messageString);

                setChats([...chats, chat]);

                if (checkIfChatIsTheSameAsUserMessagingWith(chat, currentUserMessagingWith)) {
                    setCurrentChat(chat);
                    setCurrentUserMessagingWith(null);                        
                }
            });
        }
    }

    useEffect(() => {
        assignWebsocketsHandlers(websocketsConnection);
    }, [currentChat, currentUserMessagingWith]);
    
    async function getChatsAsyncContainer() {
        const newChats = await getChats(getAccessTokenSilently)
        if (newChats) {
            setChats(newChats);
        }
    }

    useEffect(() => {
        if (thisUser != null) {
            getChatsAsyncContainer();
        }
    }, [thisUser]);

    useEffect(() => {
        async function startConnection(wc : HubConnection | null) {
            if (wc != null) {
                await wc.start()
                    .catch((err) => console.log(err));
            }
        }
        startConnection(websocketsConnection);
        assignWebsocketsHandlers(websocketsConnection);
    }, [websocketsConnection]);

    async function searchForUsers(nameOrId : string) {
        const token = await getAccessTokenSilently();

        setSearchInput(nameOrId);

        if (nameOrId !== "" && nameOrId !== null) {
            try {
                const response = await axios({
                    url: `${apiServerUrl}/chat/searchforuser/${nameOrId}`,
                    method: 'GET',
                    
                    headers: {
                        "content-type": "application/json",
                        Authorization: `Bearer ${await getAccessTokenSilently()}`,
                      },
                });
                console.log(response.data);

                setUserSearchArray(response.data)
            } catch (error) {
                if(axios.isAxiosError(error)) {
                    console.log(error.message);
                } else {
                    console.log(error);
                }
            }
        } else {
            setUserSearchArray([]);
        }
    }

    async function getUserFromDbFromArray(arr: Array<userSearch>, index: number) {
        console.log("clicked");
        setShouldDisplayUserSearchResults(false);
        setSearchInput("");

        const otherUser = await getUserFromDb(arr[index].Id);

        const token = await getAccessTokenSilently();

        setCurrentUserMessagingWith(otherUser);

        try {
            const response = await axios({
                url: `${apiServerUrl}/chat/getchatbetween2/${otherUser.Id}`,
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
            });
            
            if (response.data == "") {
                console.log("shit");
                console.log("This it chat 2");
                setCurrentChat(null);
            } else {
                console.log("This it chat 3");
                setCurrentChat(response.data);
                setCurrentUserMessagingWith(null);
            }
        } catch (error) {
            if(axios.isAxiosError(error)) {
                console.log(error.message);
            } else {
                console.log(error);
            }
        }
    }

    async function getUserFromDb(userId: string) {
        const token = await getAccessTokenSilently();

        try {
            const response = await axios({
                url: `${apiServerUrl}/chat/getuser/${userId}`,
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            if(axios.isAxiosError(error)) {
                console.log(error.message);
            } else {
                console.log(error);
            }
        }
    }

    function createUserSearchComponent(u: userSearch, i: number) {
        const divContains = <>
                                {u.Name + " "}
                                <p className="search-item-user-id">{u.Id}</p>
                            </>
        console.log(searchElementHovered);
        if (i != searchElementHovered) {
            return <div 
                key={i} 
                className="search-item"
                onMouseEnter={() => setSearchElementHovered(i)}
            >
                {divContains}
            </div>
        }
        return <div 
            key={i} 
            className="search-item-hover"
            onMouseLeave={() => setSearchElementHovered(null)}
            onClick={() => getUserFromDbFromArray(userSearchArray, i)}
        >
            {divContains}
        </div>
    }

    function mapUserSearchArray(array: Array<userSearch>) {
        if (shouldDisplayUserSearchResults) {
            return <div id="search-items-box">
                {array.map((u, i) => createUserSearchComponent(u, i))}
            </div>
        } else {
            console.log("null");
            return null;
        }
    }

    function mapChats(chatsParam: Array<chat>) {
        console.log(chats);
        return chatsParam.map((chat, index) => 
            mapChat(chat, index)
        );
    }

    function mapChat(chat: chat, index: number) {
        const nameAndImage = createChatNameWithChat(chat, thisUser);

        return <div 
            key={index} 
            onClick={() => setCurrentChat(chat)} 
            className="scrool-page-item"
        >
            <img className="chat-image" src={nameAndImage.image} />
            <span className="scrool-page-item-text">{nameAndImage.name}</span>
        </div>
    }

    //<h1>Test Chat Page</h1>
    //<button onClick={() => sendMessage("Hello World")}>Send message</button>
    return (
        <>
            <MenuContainer 
                chatsStr={"chats"} menuStr={"menu"} accountInfoStr={"userInfo"} 
                mapChats={mapChats}
                setShouldDisplayUserSearchResults={setShouldDisplayUserSearchResults}
                searchForUsers={searchForUsers}
                mapUserSearchArray={mapUserSearchArray}
                chats={chats}
                userSearchArray={userSearchArray}
                searchInput={searchInput}
                searchElementHovered={searchElementHovered}
                thisUser={thisUser}
            />
            {(currentUserMessagingWith || currentChat) && thisUser ? <ChatWithUser user={currentUserMessagingWith} chat={currentChat} thisUserFromDb={thisUser} websocket={websocketsConnection} /> : null}
        </>
    )
}