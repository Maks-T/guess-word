function generateId() {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 5; i++) {
        randomString += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return randomString;
}

module.exports = {generateId};