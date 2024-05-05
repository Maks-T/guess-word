
class Avatars {
    countFemales = 48;
    countMales = 55;

    curSex = 'male';
    curAvatarNumber = 1;

    constructor(root, assetsPaths = '/assets/avatars/') {
        this.root = root;
        this.assetsPaths = assetsPaths;

        this.render();
    }

    render = () => {
        this.curAvatarNumber = Math.floor(Math.random() *  this.getMaxAvatarCount()) + 1;
        this.createElements();
    }

    setCurAvatarNumber = (avatarNumber) => {
        this.curAvatarNumber = avatarNumber;
        this.avatarImg.src = this.getImgSrc(avatarNumber);
    }
    
    setCurSex = (sex) => {
        this.curSex = sex;
        this.render();
    }

    createElements = () => {
        this.root.innerHTML = '';

        const avatarWrapElem = this.createAvatarElement();
        const sliderElement = this.createSliderElement();
        this.root.append(avatarWrapElem, sliderElement);
    }

    getMaxAvatarCount = () => {
        return this.curSex === 'male' ? this.countMales : this.countFemales;
    }

    getImgSrc = (avatarNumber) => {
        return `${this.assetsPaths}${this.curSex}/${this.curSex}_${avatarNumber}.png`;
    }

    getCurImgSrc = () => this.getImgSrc(this.curAvatarNumber);


    createAvatarElement = () => {
        const avatarWrapElem = document.createElement('div');
        avatarWrapElem.classList.add('avatar');

        this.avatarImg = document.createElement('img');
        this.avatarImg.src = this.getImgSrc(this.curAvatarNumber);

        avatarWrapElem.append(this.avatarImg);

        return avatarWrapElem;
    }

    createSliderElement = () => {
        const sliderContainerElem = document.createElement('div');
        sliderContainerElem.classList.add('avatars__slider_container');

        const sliderElem = document.createElement('div');
        sliderElem.classList.add('swiper', 'avatars__slider');

        const slidesElem = this.createSlidesElement();
        slidesElem.classList.add('swiper-wrapper');

        sliderElem.append(slidesElem);

        sliderContainerElem.append(sliderElem);

        this.slider = this.createSliderSwiper(sliderElem);

        return sliderContainerElem;
    }

    createSlidesElement = () => {
        const sliderWrapperElem = document.createElement('div');
        sliderWrapperElem.classList.add('swiper-wrapper');

        const maxCount = this.getMaxAvatarCount();

        const slides = [];

        for (let i= 1; i <=maxCount; i++)
        {
            const slideElem = document.createElement('div');
            slideElem.classList.add('swiper-slide');
            slideElem.dataset.number = String(i);

            const imgElem = document.createElement('img');
            imgElem.src = this.getImgSrc(i);

            slideElem.append(imgElem);

            slides.push(slideElem);

        }
        slides.sort((a,b) => Math.random() - 0.5);

        sliderWrapperElem.append(...slides);

        return sliderWrapperElem;
    }

    createSliderSwiper = (sliderElement) => {
        console.log('sliderElement  ', sliderElement)
        return new Swiper(sliderElement, {

            loop: true,

            slidesPerView: 5.5,
            spaceBetween: 10,

            on: {
                click: (swiper, event) => {
                  const avatarNumber  = swiper.clickedSlide.dataset.number ?? null;

                  if (avatarNumber) {
                      this.setCurAvatarNumber(avatarNumber);
                  }
                },
            }

        });

    }

}

const avatarsElem = document.getElementById('avatars');

const avatars = new Avatars(avatarsElem);

const radios = container.querySelector('.form__radios');

radios.addEventListener('change', (e) => {
   const target = e.target;

   if (target && (target.name = 'sex') && target.checked) {

       avatars.setCurSex(target.value);
   }
});

const btnSaveElem = document.getElementById('btn-save');
const nameElem = document.querySelector('[name="name"]');
const surnameElem = document.querySelector('[name="surname"]');

const capitalize = (string)  => string.charAt(0).toUpperCase() + string.slice(1);


const handleInputs = () => {
    if (!nameElem.value || !surnameElem.value) {
        btnSaveElem.disabled = true;
    }

    if (nameElem.value && surnameElem.value) {

        btnSaveElem.disabled = false;
    }
}

nameElem.addEventListener('input', handleInputs);
surnameElem.addEventListener('input', handleInputs);

btnSaveElem.addEventListener('click', () => {
    btnSaveElem.disabled = true;

    const userInfo = {
        name: capitalize(nameElem.value),
        surname: capitalize(surnameElem.value),
        sex: avatars.curSex,
        avatar: avatars.getCurImgSrc()
    };

    socket.emit('addUser', userInfo);

    socket.on('addUser', (userInfo) => {
        setCookies('userInfo', userInfo);
        location.reload();
        console.log(userInfo);
    });

})
