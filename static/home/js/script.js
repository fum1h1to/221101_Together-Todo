const getCookie = (name) => {
    if (document.cookie && document.cookie !== '') {
        for (const cookie of document.cookie.split(';')) {
            const [key, value] = cookie.trim().split('=')
            if (key === name) {
                return decodeURIComponent(value)
            }
        }
    }
}
const csrftoken = getCookie('csrftoken')

const modalOption = {
    keyboard: false
}
const modal_accountSetting = new bootstrap.Modal(document.getElementById('modal_accountSetting'), modalOption);
const modal_checkPassword = new bootstrap.Modal(document.getElementById('modal_checkPassword'), modalOption);
const modal_accountEdit = new bootstrap.Modal(document.getElementById('modal_accountEdit'), modalOption);
const modal_accountDelete = new bootstrap.Modal(document.getElementById('modal_accountDelete'), modalOption);
const modal_accountLogout = new bootstrap.Modal(document.getElementById('modal_accountLogout'), modalOption);


const form_ceckPassword = document.querySelector("#form_checkPassword");
form_ceckPassword.addEventListener("submit", function (e) {
    e.preventDefault();

    const body = new URLSearchParams()
    body.append('password', form_ceckPassword.password.value)

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: body
    };

    fetch(form_ceckPassword.url.value, sendOption)
        .then(res => {
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                modal_checkPassword.hide();
                modal_accountEdit.show();
            } else {

            }
        })
});

const form_userUpdate = document.querySelector("#form_userUpdate");
form_userUpdate.addEventListener("submit", function (e) {
    e.preventDefault();

    const body = new FormData()
    body.append('icon', form_userUpdate.icon.files[0])
    body.append('username', form_userUpdate.username.value)
    body.append('email', form_userUpdate.email.value)
    body.append('password', form_userUpdate.password.value)

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'multipart/form-data',
        },
        body: body
    };
    delete sendOption.headers['Content-Type'];

    fetch(form_userUpdate.url.value, sendOption)
        .then(res => {
            console.log(res.json());
        });
});