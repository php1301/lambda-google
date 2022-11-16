export async function sleep(millis) {
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve(true);
        }, millis)
    );
}