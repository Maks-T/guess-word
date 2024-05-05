const btnSaveElem = document.getElementById('btn-save');
const nameElem = document.querySelector('[name="name"]');
const isPrivateElem = document.querySelector('#is-private');

nameElem.value = generateRandomTeamName();

const handleInputs = () => {
    if (!nameElem.value) {
        btnSaveElem.disabled = true;
    }

    if (nameElem.value) {
        btnSaveElem.disabled = false;
    }
}

nameElem.addEventListener('input', handleInputs);

btnSaveElem.addEventListener('click', () => {
    btnSaveElem.disabled = true;


    const url = '/team_create';
    const data = {
        name: nameElem.value,
        isPrivate: isPrivateElem.checked,
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json(); // Если запрос успешен, преобразовать ответ в JSON
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {

            if (data.status === 'success') {
                location.replace(`/team/${data.id}/link`);
            } else {
                //To handle errors
                location.replace('/teams');
            }

            btnSaveElem.disabled = true;

        })
        .catch(error => {
            console.error('Error:', error);
        });
});



// Функция для генерации случайного имени команды на основе слогов
function generateRandomTeamName() {
    // Массивы слогов для генерации имен команд
    const prefixes = [
        "tri", "mon", "ver", "lux", "mir", "zan", "nal", "rok", "yth", "tep",
        "zan", "nix", "vex", "sor", "hex", "zel", "vol", "lar", "fel", "zen",
        "gon", "fro", "dra", "qui", "tho", "sto", "shi", "ali", "ker", "qua",
        "pol", "xor", "iph", "erp", "ter", "mir", "del", "var", "cos", "nas",
        "sol", "rin", "tir", "jor", "qua", "zen", "yon", "dag", "rif", "vul"
    ];

    const suffixes = [
        "ius", "or", "us", "ix", "on", "an", "ar", "en", "is", "or",
        "um", "el", "ix", "ex", "il", "ir", "or", "us", "ax", "io",
        "ix", "ox", "un", "an", "es", "os", "ur", "al", "ol", "id",
        "on", "ix", "en", "yl", "us", "ar", "ir", "or", "ut", "at",
        "ez", "im", "ac", "ad", "op", "id", "eg", "ap", "og", "ut"
    ];

    const randomPrefix = getRandomElement(prefixes);
    const randomSuffix = getRandomElement(suffixes);

    // Формирование имени команды путем комбинирования случайного префикса и суффикса
    const teamName = randomPrefix + randomSuffix;

    // Сделать первую букву имени заглавной
    return capitalizeFirstLetter(teamName);
}

// Функция для получения случайного элемента из массива
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Функция для преобразования первой буквы строки в заглавную
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}