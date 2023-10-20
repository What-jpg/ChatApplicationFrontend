interface Children {
    children: JSX.Element
}

export default function SavePageLink({children}: Children) {
    const location = "/" + window.location.href.split('/').slice(3).join("/");

    console.log(location);

    localStorage.setItem("lastVisitedPage", location)

    return children
}