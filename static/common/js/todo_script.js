/* ----------------------------
共通の処理
----------------------------- */
// cookieの取得
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

// modalの要素取得
const modalOption = {
    keyboard: false
}
const modal_accountSetting = new bootstrap.Modal(document.getElementById('modal_accountSetting'), modalOption);
const modal_checkPassword = new bootstrap.Modal(document.getElementById('modal_checkPassword'), modalOption);
const modal_accountEdit = new bootstrap.Modal(document.getElementById('modal_accountEdit'), modalOption);
const modal_accountDelete = new bootstrap.Modal(document.getElementById('modal_accountDelete'), modalOption);
const modal_accountLogout = new bootstrap.Modal(document.getElementById('modal_accountLogout'), modalOption);

const modal_commonError = new bootstrap.Modal(document.getElementById('modal_commonError'), modalOption);

// formの要素取得
const form_ceckPassword = document.getElementById("form_checkPassword");
const form_userUpdate = document.getElementById("form_userUpdate");
const form_userDelete = document.getElementById("form_userDelete");
const form_accountFind = document.getElementById("form_accountFind");

// アカウント編集フォームの初期化処理
let userUpdateForm_originalIconSrc = form_userUpdate.querySelector('.account-icon').src;
const userUpdateFormReset = () => {
    form_userUpdate.querySelector('.account-icon').src = userUpdateForm_originalIconSrc;
    form_userUpdate.reset();
}

// passwordチェックフォームの初期化処理
const passwordCheckFormReset = () => {
    form_ceckPassword.reset();
}

// ユーザ削除フォームの初期化処理
const userDeleteFormReset = () => {
    form_userDelete.reset();
}

document.getElementById('btn_iconLogo').addEventListener('click', function(e) {
    passwordCheckFormReset();
    userDeleteFormReset();
    userUpdateFormReset();
})

/* ----------------------------
modal_commonError
----------------------------- */
document.getElementById('modal_commonError').addEventListener('hidden.bs.modal', (e) => {
    const moreinfo = document.getElementById('modal_commonError').querySelector('.more-info');
    moreinfo.textContent = ''
})

const modal_commonError_moreInfoUpdate = (updateTxt) => {
    const moreinfo = document.getElementById('modal_commonError').querySelector('.more-info');
    moreinfo.textContent = updateTxt;
}

/* ----------------------------
パスワードのチェック処理
----------------------------- */
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
                form_ceckPassword.querySelector('.form-text').textContent = 'パスワードが一致しませんでした。';
            }
        })
});


/* ----------------------------
ユーザ編集の処理
----------------------------- */
// formでアイコンが選択されたら表示する処理
document.getElementById('account_iconUpload').addEventListener('change', (e) => {
    let fileList = e.target.files;
    let imageOutputElement = form_userUpdate.querySelector('.account-icon')
    let fileReader = new FileReader();
    let file = fileList[0];

    fileReader.onload = function(e) {
        imageOutputElement.src = e.target.result;
    }
    fileReader.readAsDataURL( file );
});

// formの処理
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
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                location.reload();
            } else {
                accountUpdate_inputError(res.error)
            }
        })
    
    const accountUpdate_inputError = (error) => {
        error.icon ? form_userUpdate.querySelector('.icon-error').textContent = error.icon : form_userUpdate.querySelector('.icon-error').textContent = "";
        error.username ? form_userUpdate.querySelector('.username-error').textContent = error.username : form_userUpdate.querySelector('.username-error').textContent = "";
        error.email ? form_userUpdate.querySelector('.email-error').textContent = error.email : form_userUpdate.querySelector('.email-error').textContent = "";
        error.password ? form_userUpdate.querySelector('.password-error').textContent = error.password : form_userUpdate.querySelector('.password-error').textContent = "";
    }
});


/* ----------------------------
ユーザ削除の処理
----------------------------- */
form_userDelete.addEventListener("submit", function (e) {
    e.preventDefault();

    let collect_username = form_userDelete.collect_username.value;
    let username = form_userDelete.username.value;
    if(collect_username === username) {
        const sendOption = {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        };
    
        fetch(form_userDelete.url.value, sendOption)
            .then(res => {
                return res.json();
            })
            .then((res) => {
                if (res.result) {
                    window.location.href = '/';
                } else {
    
                }
            })
    }

});