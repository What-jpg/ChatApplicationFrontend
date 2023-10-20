import axios from "axios";

export default async function getMessages(chatId: number, getAccessTokenSilently: () => Promise<string>) {
    //const token = await getAccessTokenSilently();
    const apiServerUrl = process.env.REACT_APP_API_SERVER_URL;

    try {
        const response = await axios({
            url: `${apiServerUrl}/chat/getmessages/${chatId}`,
            method: 'GET',
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${await getAccessTokenSilently()}`,
            }
        });

        return response.data;
    } catch (error) {
        if(axios.isAxiosError(error)) {
            try {
                const response = await axios({
                    url: `${apiServerUrl}/chat/getmessages/${chatId}`,
                    method: 'GET',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `Bearer ${await getAccessTokenSilently()}`,
                    }
                });
        
                return response.data;
            } catch (error) {
                if(axios.isAxiosError(error)) {
                    
                    console.log(error.message);
                } else {
                    console.log(error);
                }
            }
        } else {
            console.log(error);
        }
    }

    //return [];
}