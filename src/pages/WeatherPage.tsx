import { withAuthenticationRequired } from "@auth0/auth0-react"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios";
import { useState, useEffect } from "react"

export default function WeatherPage() {
    const [forecast, setForecast] = useState("fetching to server");

    const { getAccessTokenSilently } = useAuth0();

    async function getForecast() {
        const apiServerUrl = process.env.REACT_APP_API_SERVER_URL;
        const accessToken = await getAccessTokenSilently();

        try {
            const response = await axios({
                url: `${apiServerUrl}/weatherforecast/db/get`,
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
            });
            setForecast(JSON.stringify(response.data));
        } catch (error) {
            if(axios.isAxiosError(error)) {
                setForecast(error.message);
            }
        }
    }

    useEffect(() => {
        getForecast();
    }, [])

    return (
        <h1>Forecast: {forecast}</h1>
    );
}