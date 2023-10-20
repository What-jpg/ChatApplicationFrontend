import { useAuth0 } from "@auth0/auth0-react"
import { Navigate, redirect } from "react-router-dom";

export default function CallbackPage() {
    const { error } = useAuth0();

    /*const lastVisitedPage = localStorage.getItem("lastVisitedPage");

    if (lastVisitedPage) {
        return <Navigate to={lastVisitedPage} />
    } else {
        return <Navigate to="/" />
    }*/

    if (error) {
        return (
            <h1>Error: {error.message}</h1>
        )
    }

    

    return (
        <>
        <h1>Callback page</h1>
        <p>Wait for redirect...</p>
        </>
    )
}