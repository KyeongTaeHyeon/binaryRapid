export function LoadData(route) {
    return fetch(route).then((response) => {
        if (!response.ok) {
            // 401 Unauthorized 등 에러 발생 시 상태 코드를 포함한 에러 객체 생성
            const error = new Error(`Network response was not ok: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return response.json();
    });
}
