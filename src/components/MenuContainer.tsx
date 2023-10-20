import { useState } from "react";
import { chat, userSearch, userFromDb } from "../pages/ChatPage";
import { useAuth0 } from "@auth0/auth0-react";
import "../icons.css";
import "../css/menu.css";
import "../css/profileImage.css";

interface MenuContainer {
    chatsStr: string, menuStr: string, accountInfoStr: string, 
    mapChats: (chatsParam: Array<chat>) => JSX.Element[],
    setShouldDisplayUserSearchResults: (value: React.SetStateAction<boolean>) => void,
    searchForUsers: (nameOrId: string) => Promise<void>,
    mapUserSearchArray: (array: Array<userSearch>) => JSX.Element | null,
    chats: chat[],
    userSearchArray: userSearch[],
    searchInput: string,
    searchElementHovered: number | null,
    thisUser: userFromDb | null
}

export default function MenuContainer(
    {chatsStr, menuStr, accountInfoStr, 
    mapChats,
    setShouldDisplayUserSearchResults,
    searchForUsers,
    mapUserSearchArray,
    chats,
    userSearchArray,
    searchInput,
    searchElementHovered,
    thisUser}: MenuContainer
    ) {
    const [currentType, setCurrentType] = useState(chatsStr);
    const { logout } = useAuth0();

    switch (currentType) {
        case menuStr:
            return <div id="menu-container">
                <div id="menu-top-elements-container">
                    <div id="menu-box">
                        <div className="gg-close-o" onClick={() => setCurrentType(chatsStr)} />
                    </div>
                    <div id="menu-header-box">
                        <span id="menu-header">Menu</span>
                    </div>
                </div>
                <p><button onClick={() => setCurrentType(accountInfoStr)}>Account info</button></p>
                <p><button onClick={function () { logout({
                    logoutParams: {
                    returnTo: window.location.origin,
                    },
                }) }} >Log out</button></p>
            </div>;
    
        case chatsStr:
            return <div id="#scroll-page-user-input-container">          
                <div id="scrool-page">
                    {mapChats(chats)}
                </div>
                <div id="top-elements-container">
        
                    <div id="menu-box">
                        <div className="gg-menu-round" onClick={() => setCurrentType(menuStr)} />
                    </div>
                    <div id="user-search-input-container">
                        <input 
                            id="user-search-input"
                            placeholder="Search for users by id" 
                            value={searchInput}
                            onChange={e => searchForUsers(e.target.value)} 
                            onBlur={() => searchElementHovered !== null ? null : setShouldDisplayUserSearchResults(false)}
                            onFocus={() => setShouldDisplayUserSearchResults(true)}
                        />
                        {userSearchArray.length == 0 ? null : mapUserSearchArray(userSearchArray)}
                    </div>
                </div>
            </div>;

            case accountInfoStr:
                return <div id="menu-container">
                    <div id="menu-top-elements-container">
                        <div id="menu-box">
                            <div className="gg-arrow-left-o" onClick={() => setCurrentType(menuStr)} />
                        </div>
                        <div id="menu-header-box">
                            <span id="menu-header">Account info</span>
                        </div>
                    </div>
                    {thisUser ? <div>
                        <img className="profile-image" src={thisUser.Picture ? thisUser.Picture : undefined} />
                        <p>Name: {thisUser.Name}</p>
                        <p>Id: {thisUser.Id}</p>
                    </div> : null}
                </div>;

        default:
            return null;
    }
}