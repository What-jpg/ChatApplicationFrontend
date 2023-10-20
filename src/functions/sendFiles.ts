import { HubConnection } from "@microsoft/signalr";
import { ReadStream } from "fs";
import { chat, userFromDb } from "../pages/ChatPage";
import { sendMessageForFirstTime, trySendMessage } from "../components/ChatWithUser";

export default async function sendFiles(e: React.ChangeEvent<HTMLInputElement>, websocket: HubConnection | null, chat: chat | null, user: userFromDb | null) {
    const files = e.target.files;

    const reader = new FileReader();

    if (files) {
        for (let index = 0; index < files.length; index++) {
            const file = files[index];

            /*const content = await file.text();

            console.log(content);*/

            /*if (chat) {
                trySendMessage(content, file.name + ".-." + file.type, websocket, chat);
            } else {
                sendMessageForFirstTime(content, file.name + ".-." + file.type, websocket, user);
            }*/

            reader.onload = function () {
                console.log(file.name);
                console.log(file.type);
                if (typeof this.result != "string" && this.result != null) {
                    var dec = new TextDecoder("utf-8");
                    var enc = new TextEncoder();
                    const content = /*dec.decode(new Uint8Array(this.result))*//*arrayBufferToBase64String*/arrayBufferToBase64String(this.result);
                    const encoded = /*enc.encode(content)*//*new Uint8Array(base64StringToArrayBuffer(content));*/base64StringToArrayBuffer(content);
                    console.log(this.result);
                    console.log(content);
                    console.log(encoded)
                    console.log(file.size);
                    if (chat) {
                        trySendMessage(content, file.name + ".-." + file.type, websocket, chat);
                    } else {
                        sendMessageForFirstTime(content, file.name + ".-." + file.type, websocket, user);
                    }
                }
            }

            console.log(file.type);
            
            reader.readAsArrayBuffer(file);
        }
    }

    e.target.value = "";
}

export function arrayBufferToBase64String(buffer: ArrayBuffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

export function base64StringToArrayBuffer(base64String: string) {
    return Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
}
