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

// Получаем элементы DOM
const inputName = document.getElementById('inputName');
const saveNameBtn = document.getElementById('btn-save-name');

// Добавляем обработчик события на кнопку сохранения
saveNameBtn.addEventListener('click', function () {
  // Получаем значение из поля ввода

  if (!inputName.value) return;

  // Устанавливаем куку с именем и значением

  const userInfo = {
    name: inputName.value,
    id: generateId(),
  };

  const encodedUserInfo = encodeURIComponent(JSON.stringify(userInfo));

  if (document.cookie) {
    document.cookie = `${document.cookie}; userInfo=${encodedUserInfo}`;
  } else {
    document.cookie = `userInfo=${encodedUserInfo}`;
  }

  const backUrl = saveNameBtn.dataset.backUrl ?? '';
  window.location.href = `/${backUrl}`;
});
