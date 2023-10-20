export default function stringToBase64String(string: string) {
    return btoa(encodeURIComponent(string));
}