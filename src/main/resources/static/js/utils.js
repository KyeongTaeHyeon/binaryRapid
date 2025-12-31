export function LoadData(route) {
    return fetch(route).then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    });
}
