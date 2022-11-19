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

const modal_todoCreate = new bootstrap.Modal(document.getElementById('modal_todoCreate'), modalOption);
const modal_todoSelectRequest = new bootstrap.Modal(document.getElementById('modal_todoSelectRequest'), modalOption);
const modal_todoSelectBocchi = new bootstrap.Modal(document.getElementById('modal_todoSelectBocchi'), modalOption);

const modal_todoCreate_success = new bootstrap.Modal(document.getElementById('modal_todoCreate_success'), modalOption);
const modal_todoCreate_numCheck = new bootstrap.Modal(document.getElementById('modal_todoCreate_numCheck'), modalOption);
const modal_todoCreate_failed = new bootstrap.Modal(document.getElementById('modal_todoCreate_failed'), modalOption);


// formの要素取得
const form_ceckPassword = document.getElementById("form_checkPassword");
const form_userUpdate = document.getElementById("form_userUpdate");
const form_userDelete = document.getElementById("form_userDelete");
const form_accountFind = document.getElementById("form_accountFind");

const form_todoCreate = document.getElementById("form_todoCreate");
const form_todoSelectBocchi = document.getElementById('form_todoSelectBocchi');

// このページ内で使う変数
const todoCreate_requestUsers = new Set();


// passwordチェックフォームの初期化処理
const passwordCheckFormReset = () => {
    form_ceckPassword.reset();
}

// ユーザ削除フォームの初期化処理
const userDeleteFormReset = () => {
    form_userDelete.reset();
}

// todoのフォーム初期化処理
const todoCreateFormReset = () => {
    form_todoCreate.reset();
    form_todoSelectBocchi.reset();
    form_accountFind.reset();
    todoCreate_requestUsers.clear();
}

document.getElementById('btn_iconLogo').addEventListener('click', function(e) {
    passwordCheckFormReset();
    userDeleteFormReset();
})

document.getElementById('btn_taskPlusButton').addEventListener('click', function(e) {
    todoCreateFormReset();
})

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

            }
        })
});


/* ----------------------------
ユーザ編集の処理（未完成）
----------------------------- */
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
                modal_accountEdit.hide();
                modal_accountSetting.show();
            } else {

            }
        })
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


/* ----------------------------
依頼者選択画面での処理
----------------------------- */
form_accountFind.addEventListener("submit", function (e) {
    e.preventDefault();

    const body = new URLSearchParams()
    body.append('searchname', form_accountFind.searchname.value)

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: body
    };

    // ユーザがクリックされたときの処理
    const clickFindUser = (e) => {
        todoCreate_requestUsers.add(e.target.dataset.username);
    }

    fetch(form_accountFind.url.value, sendOption)
        .then(res => {
            return res.json();
        })
        .then((res) => {
            const userListElement = document.querySelector('#modal_todoSelectRequest section ol');
            userListElement.innerHTML = '';
            if(res.finduser) {
                if(res.finduser.length != 0){
                    for(let user in res.finduser) {
                        userListElement.innerHTML += '<li class="add_finduser cursor-pointer" data-username=' + res.finduser[user] + '>' + res.finduser[user] + '<img src="/static/home/images/add_circle_FILL0_wght400_GRAD0_opsz48.png" class="addPlus"></li>'
                    }
                    const finduserElements = document.querySelectorAll('#modal_todoSelectRequest section ol .add_finduser')
                    finduserElements.forEach((ele) => {
                        ele.addEventListener('click', clickFindUser);
                    })
                } else {
                    userListElement.innerHTML = '<p>ユーザが見つかりませんでした。</p>';
                }
            } else {
                userListElement.innerHTML = '<p>ユーザが見つかりませんでした。</p>';
            }
        })
});


/* ----------------------------
依頼者一覧画面での処理
----------------------------- */
document.getElementById('btn_todoRequestUserList').addEventListener('click', (e) => {
    e.preventDefault();

    // ユーザがクリックされたときの処理
    const clickUser = (e) => {
        todoCreate_requestUsers.delete(e.target.dataset.username);
    }

    const userlistElement = document.querySelector('#modal_todoListRequest section ol');
    userlistElement.innerHTML = '';
    if(todoCreate_requestUsers.size != 0) {
        for(let user of todoCreate_requestUsers) {
            userlistElement.innerHTML += '<li class="remove_finduser cursor-pointer" data-username=' + user + '>' + user + '<img src="/static/home/images/do_not_disturb_on_FILL0_wght400_GRAD0_opsz48.png" class="addPlus"></li>'
        }
        const userElements = document.querySelectorAll('#btn_todoRequestUserList section ol .remove_finduser')
        userElements.forEach((ele) => {
            ele.addEventListener('click', clickUser);
        })
    } else {
        userlistElement.innerHTML = '<p>依頼者はまだ選択されていません。</p>';
    }
});


/* ----------------------------
タスク作成処理
----------------------------- */
(function () {
    // 期限日の処理
    let optionLoop, this_day, this_month, this_year, today;
    today = new Date();
    this_year = today.getFullYear();
    this_month = today.getMonth() + 1;
    this_day = today.getDate();

    optionLoop = function (start, end, d_class, this_day) {
        var i, opt;

        opt = null;
        for (i = start; i <= end; i++) {
            if (i === this_day) {
                opt += "<option value='" + i + "' selected>" + i + "</option>";
            } else {
                opt += "<option value='" + i + "'>" + i + "</option>";
            }
        }
        return form_todoCreate.querySelector(d_class).innerHTML = opt;
    };

    optionLoop(2022, this_year + 10, '.year', this_year);
    optionLoop(1, 12, '.month', this_month);
    optionLoop(1, 31, '.day', this_day);

    // メモ欄の文字制限
    form_todoCreate.note.addEventListener('keyup', function() {
        form_todoCreate.querySelector('.note-limit .num').textContent = 300 - form_todoCreate.note.value.length
    });

})();

const todoCreate_sendData = (isBocchi) => {
    const body = new URLSearchParams()

    let taskName = form_todoCreate.taskName.value;
    body.append('taskName', taskName);

    let year = form_todoCreate.year.value;
    let month = form_todoCreate.month.value;
    let day = form_todoCreate.day.value;
    let deadline = year + '-' + month + '-' + day + ' 00:00:00';
    body.append('deadline', deadline);

    let importance = 1;
    for(var i=0; i < form_todoCreate.importance.length-1; i++){
        if(form_todoCreate.importance[i].checked){
            importance = i
        }
    }
    body.append('importance', importance);

    let note = form_todoCreate.note.value;
    body.append('note', note);
    
    let bocchi = form_todoSelectBocchi.bocchi.value;
    body.append('bocchi', isBocchi ? bocchi : 0);

    for(let user of todoCreate_requestUsers) {
        body.append('requestUsers', user);
    }

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: body
    };

    fetch(form_todoCreate.url.value, sendOption)
        .then(res => {
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                modal_todoSelectBocchi.hide();
                modal_todoSelectRequest.hide();
                modal_todoCreate_numCheck.hide();
                modal_todoCreate_success.show();
                todoCreateFormReset();
            } else {
                modal_todoSelectBocchi.hide();
                modal_todoSelectRequest.hide();
                modal_todoCreate_numCheck.hide();
                modal_todoCreate_failed.show();
                todoCreate_inputError(res.error);
            }
        })
    
    const todoCreate_inputError = (error) => {
        error.taskName ? form_todoCreate.querySelector('.task-error').textContent = error.taskName : form_todoCreate.querySelector('.task-error').textContent = "";
        error.deadline ? form_todoCreate.querySelector('.deadline-error').textContent = error.deadline : form_todoCreate.querySelector('.deadline-error').textContent = "";
        error.importance ? form_todoCreate.querySelector('.importance-error').textContent = error.importance : form_todoCreate.querySelector('.importance-error').textContent = "";
        error.note ? form_todoCreate.querySelector('.note-error').textContent = error.note : form_todoCreate.querySelector('.note-error').textContent = "";
        error.bocchi ? form_todoSelectBocchi.querySelector('.bocchi-error').textContent = error.bocchi : form_todoSelectBocchi.querySelector('.bocchi-error').textContent = "";
        error.requestUsers ? document.querySelector('#modal_todoSelectRequest .requestUsers-error p').textContent = error.requestUsers : document.querySelector('#modal_todoSelectRequest .requestUsers-error p').textContent = "";
    }
}

// ボッチモードの場合
document.getElementById('btn_todoSelectBocchi').addEventListener("click", function(e) {
    e.preventDefault();

    todoCreate_sendData(isBochi=true);
})

// 依頼者を選択する場合
document.getElementById('btn_todoSelectRequest').addEventListener("click", function(e) {
    e.preventDefault();

    if(todoCreate_requestUsers.size == 0) {
        modal_todoCreate_numCheck.show();
    } else {
        todoCreate_sendData(isBochi=false);
    }
})
document.getElementById('btn_todoSelectRequest_numCollect').addEventListener("click", function(e) {
    e.preventDefault();

    todoCreate_sendData(isBochi=false);
})