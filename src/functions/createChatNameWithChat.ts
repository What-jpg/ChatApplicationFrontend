import { chat, userFromDb } from "../pages/ChatPage";

export interface chatNameAndImage {
    name: string,
    image: string
}

export default function createChatNameWithChat(chat: chat, thisUser: userFromDb | null) {
    console.log(chat);

    let shouldReturn = false;
    let shouldReturnName = "";
    let shouldReturnImage = "";

    if (chat.Users?.length == 2/* || chat.Users?.length == 1*/) {
        chat.Users?.forEach(element => {
            if (element.Id != thisUser?.Id) {                    
                shouldReturn = true;
                shouldReturnName = element.Name;
                shouldReturnImage = element.Picture != null ? element.Picture : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fuser_666201&psig=AOvVaw2Q05esAhFig9l9rfkqu7VR&ust=1697399504572000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCLDAjYeo9oEDFQAAAAAdAAAAABAE";
            }
        });


        return {name: shouldReturnName, image: shouldReturnImage};
    } else {
        let usersHere: Array<string> = [];

        chat.Users?.forEach(element => {
            usersHere[usersHere.length] = element.Name;
        });

        const chatName = usersHere.join(", ")

        return {name: chatName, image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fgroup_615075&psig=AOvVaw2vg-IApg1fG6BC9V09Hi3C&ust=1697385936382000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCOinwMH19YEDFQAAAAAdAAAAABAR"};
    }
}