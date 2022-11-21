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
let todoCreate_requestUsers = {} // 選択した依頼者のiconを管理する。
const myTaskList = [] // タスクを保持する配列

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
    todoCreate_requestUsers = {};
}

document.getElementById('btn_iconLogo').addEventListener('click', function(e) {
    passwordCheckFormReset();
    userDeleteFormReset();
})

document.getElementById('btn_taskPlusButton').addEventListener('click', function(e) {
    todoCreateFormReset();
})


/* ----------------------------
タスクの表示処理
----------------------------- */
const getMyTaskList_and_disp = () => {
    const body = new URLSearchParams()

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
    };

    fetch('/todo/show/', sendOption)
        .then(res => {
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                myTaskList.splice(0);
                for(let task in res.tasks) {
                    myTaskList.push(res.tasks[task])
                }
                taskDisp();
            } else {

            }
        })
    
    const taskDisp = () => {
        const myTaskList_1 = document.querySelector('#myTaskList-collapseOne .myTaskList');
        const myTaskList_2 = document.querySelector('#myTaskList-collapseTwo .myTaskList');
        const myTaskList_3 = document.querySelector('#myTaskList-collapseThree .myTaskList');
        myTaskList_1.innerHTML = '';
        myTaskList_2.innerHTML = '';
        myTaskList_3.innerHTML = '';
        
        let task1count = 0;
        let task2count = 0;
        let task3count = 0;

        myTaskList.forEach(task => {
            if(task['status'] == 0) {
                data = '<li class="myTaskListItem">';
                data += '<div class="myTaskListItem__icon"><img src="/static/home/images/icon_noncheck.svg" alt=""></div>';
                data += '<div class="myTaskListItem__text">' + task['taskName'] + '</div>';
                data += '</li>';
                myTaskList_1.innerHTML += data;
                task1count += 1;
            } else if(task['status'] == 1) {
                data = '<li class="myTaskListItem">';
                data += '<div class="myTaskListItem__icon"><img src="/static/home/images/icon_send.svg" alt=""></div>';
                data += '<div class="myTaskListItem__text">' + task['taskName'] + '</div>';
                data += '<div class="myTaskListItem__users">';
                // for()
                data += '<div class="myTaskListItem__user"><img src="/static/home/images/icon_human.jpeg" alt=""></div>';
                data += '<div class="myTaskListItem__user"><img src="/static/home/images/icon_human.jpeg" alt=""></div>';
                data += '<div class="myTaskListItem__user"><img src="/static/home/images/icon_human.jpeg" alt=""></div>';
                data += '</div>';
                data += '</li>';
                myTaskList_2.innerHTML += data;
                task2count += 1;
            } else if(task['status'] == 2) {
                data = '<li class="myTaskListItem">';
                data += '<div class="myTaskListItem__icon"><img src="/static/home/images/icon_send.svg" alt=""></div>';
                data += '<div class="myTaskListItem__text">' + task['taskName'] + '</div>';
                data += '<div class="myTaskListItem__users">';
                // for()
                data += '<div class="myTaskListItem__user"><img src="/static/home/images/icon_human.jpeg" alt=""></div>';
                data += '<div class="myTaskListItem__user"><img src="/static/home/images/icon_human.jpeg" alt=""></div>';
                data += '<div class="myTaskListItem__user"><img src="/static/home/images/icon_human.jpeg" alt=""></div>';
                data += '</div>';
                data += '</li>';
                myTaskList_3.innerHTML += data;
                task3count += 1;
            }
        })

        document.querySelector('#myTaskList-headingOne .task-num').innerHTML = task1count;
        document.querySelector('#myTaskList-headingTwo .task-num').innerHTML = task2count;
        document.querySelector('#myTaskList-headingThree .task-num').innerHTML = task3count;
    }
}
getMyTaskList_and_disp();

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
ユーザ編集の処理（未完成）
----------------------------- */
// アイコンを取得してくる。

// formでアイコンが選択されたら表示する処理
document.getElementById('account_iconUpload').addEventListener('change', (e) => {
    let fileList = e.target.files;
    let imageOutputElement = form_userUpdate.querySelector('.account-icon')
    let fileReader = new FileReader();
    let file = fileList[0];

    fileReader.onload = function(e) {

        imageOutputElement.src = e.target.result;
        
        console.log(e.target.result)
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
        todoCreate_requestUsers[e.target.dataset.username] = e.target.dataset.iconpath;
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
                    res.finduser.forEach(finduser => {
                        userListElement.innerHTML += '<li class="add_finduser cursor-pointer" data-username=' + finduser['username'] + ' data-iconpath=' + finduser['iconpath'] + '>' + finduser['username'] + '<img src="/static/home/images/add_circle_FILL0_wght400_GRAD0_opsz48.png" class="addPlus"></li>'
                    })
                    const finduserElements = document.querySelectorAll('#modal_todoSelectRequest section ol .add_finduser')
                    finduserElements.forEach((ele) => {
                        ele.addEventListener('click', clickFindUser);

                        iconpath = '/static/home/images/account_circle_FILL0_wght400_GRAD0_opsz48.png'
                        if(ele.dataset.iconpath !== '') {
                            iconpath = ele.dataset.iconpath;
                        }
                        ele.style.cssText = 'background-image: url(' + iconpath + ')'
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
        delete todoCreate_requestUsers[e.target.dataset.username];
        disp();
    }
    const disp = () => {
        const userlistElement = document.querySelector('#modal_todoListRequest section ol');
        userlistElement.innerHTML = '';
        if(Object.keys(todoCreate_requestUsers).length != 0) {
            for(let user in todoCreate_requestUsers) {
                userlistElement.innerHTML += '<li class="remove_finduser cursor-pointer" data-username=' + user + ' data-iconpath=' + todoCreate_requestUsers[user] + '>' + user + '<img src="/static/home/images/do_not_disturb_on_FILL0_wght400_GRAD0_opsz48.png" class="addPlus"></li>'
            }
            const userElements = document.querySelectorAll('#modal_todoListRequest section ol .remove_finduser')
            userElements.forEach((ele) => {
                ele.addEventListener('click', clickUser);
                iconpath = '/static/home/images/account_circle_FILL0_wght400_GRAD0_opsz48.png'
                if(ele.dataset.iconpath !== '') {
                    iconpath = ele.dataset.iconpath;
                }
                ele.style.cssText = 'background-image: url(' + iconpath + ')';
            })
        } else {
            userlistElement.innerHTML = '<p>依頼者はまだ選択されていません。</p>';
        }
    }

    disp();

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

    for(let user in todoCreate_requestUsers) {
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
            console.log(res);
            if (res.result) {
                modal_todoSelectBocchi.hide();
                modal_todoSelectRequest.hide();
                modal_todoCreate_numCheck.hide();
                modal_todoCreate_success.show();
                todoCreateFormReset();
                getMyTaskList_and_disp();
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

    if(Object.keys(todoCreate_requestUsers).length == 0) {
        modal_todoCreate_numCheck.show();
    } else {
        todoCreate_sendData(isBochi=false);
    }
})
document.getElementById('btn_todoSelectRequest_numCollect').addEventListener("click", function(e) {
    e.preventDefault();

    todoCreate_sendData(isBochi=false);
})