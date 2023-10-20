import { chat, userFromDb } from "../pages/ChatPage";

export default function checkIfChatIsTheSameAsUserMessagingWith(chat: chat, userMessagingWith: userFromDb | null) {
    let theSame = false;
    if (userMessagingWith && chat.Users?.length == 2) {
        chat.Users?.forEach(element => {
            if (element.Id == userMessagingWith.Id) {
                theSame = true;
            }
        });
    }
    return theSame;
}