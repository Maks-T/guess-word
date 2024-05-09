const btnBackPageElem = document.getElementById('btn-back-page');

btnBackPageElem.addEventListener('click', () => {
    window.history.back();
});