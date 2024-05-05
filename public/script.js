const PAGES = {
    teams: '/teams/'
}


const container = document.getElementById('container');

function adjustContainerSize(container, targetWidth, targetHeight, sizeFont = 18) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;


    // Calculate ratios for width and height
    const widthRatio = screenWidth / targetWidth;
    const heightRatio = screenHeight / targetHeight;

    // Determine the minimum ratio to fit the container
    const minRatio = Math.min(widthRatio, heightRatio);

    // Set wrapper width based on the calculated ratio
    container.style.width = `${targetWidth * minRatio}px`;

    // Set container height to match the viewport height
    container.style.height = `${screenHeight}px`;

    // Ensure body doesn't create additional scrollbars
    document.body.style.fontSize = `${sizeFont*minRatio}px`;
    document.body.style.overflow = 'hidden';
}

// Call the function with your container and target dimensions
adjustContainerSize(container, 390, 730);

const socket = io();

socket.emit('connection');

socket.on('hello', () => {
    console.log('hello');
});

const setCookies = (key, data, path='/') => {
    if (!key || !data) return;

    const encodedData = encodeURIComponent(JSON.stringify(data));

    if (document.cookie) {
        document.cookie = `${document.cookie}; ${key}=${encodedData}; path=${path};`;
    } else {
        document.cookie = `${key}=${encodedData}`;
    }
}


const getCookie = (key) => {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {

        const [cookieName, cookieValue] = cookie.trim().split('=');

        if (cookieName === key) {

            return decodeURIComponent(cookieValue);
        }
    }

    return null;
}
