import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react"

interface PageProp {
    page: React.ComponentType<object>
}

export default function RequireAuthenticationForPage({ page }: PageProp) {
    const Component = withAuthenticationRequired(page);

    return <Component />
}