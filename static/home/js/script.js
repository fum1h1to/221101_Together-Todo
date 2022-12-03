/* ----------------------------
共通の処理
----------------------------- */

// modalの要素取得
const modal_todoCreate = new bootstrap.Modal(document.getElementById('modal_todoCreate'), modalOption);
const modal_todoSelectRequest = new bootstrap.Modal(document.getElementById('modal_todoSelectRequest'), modalOption);
const modal_todoSelectBocchi = new bootstrap.Modal(document.getElementById('modal_todoSelectBocchi'), modalOption);
const modal_todoUpdate = new bootstrap.Modal(document.getElementById('modal_todoUpdate'), modalOption);
const modal_todoFirstCheck = new bootstrap.Modal(document.getElementById('modal_todoFirstCheck'), modalOption);

const modal_todoCreate_success = new bootstrap.Modal(document.getElementById('modal_todoCreate_success'), modalOption);
const modal_todoCreate_numCheck = new bootstrap.Modal(document.getElementById('modal_todoCreate_numCheck'), modalOption);
const modal_todoCreate_failed = new bootstrap.Modal(document.getElementById('modal_todoCreate_failed'), modalOption);
const modal_todoUpdate_completeCheck = new bootstrap.Modal(document.getElementById('modal_todoUpdate_completeCheck'), modalOption);
const modal_todoUpdate_success = new bootstrap.Modal(document.getElementById('modal_todoUpdate_success'), modalOption);
const modal_todoUpdate_send = new bootstrap.Modal(document.getElementById('modal_todoUpdate_send'), modalOption);
const modal_todoDelete_check = new bootstrap.Modal(document.getElementById('modal_todoDelete_check'), modalOption);
const modal_todoDelete_success = new bootstrap.Modal(document.getElementById('modal_todoDelete_success'), modalOption);


// formの要素取得
const form_todoCreate = document.getElementById("form_todoCreate");
const form_todoSelectBocchi = document.getElementById('form_todoSelectBocchi');
const form_todoUpdate = document.getElementById("form_todoUpdate");
const form_todoFirstCheck = document.getElementById("form_todoFirstCheck");

// このページ内で使う変数
let todoCreate_requestUsers = {} // 選択した依頼者のiconを管理する。
let myTaskList = {} // タスクを保持する配列

// todoのフォーム初期化処理
const todoCreateFormReset = () => {
    form_todoCreate.reset();
    form_todoSelectBocchi.reset();
    form_accountFind.reset();
    todoCreate_requestUsers = {};
}

document.getElementById('btn_taskPlusButton').addEventListener('click', function(e) {
    todoCreateFormReset();
})

/* ----------------------------
loadingの処理
----------------------------- */
const todo_loadingVisualBtns = document.querySelectorAll('.js-todo_loadingVisual');
todo_loadingVisualBtns.forEach(ele => {
    ele.addEventListener('click', (e) => {
        ele.classList.add('is-load');
    })
})

const todo_offLadingVisual = () => {
    todo_loadingVisualBtns.forEach(ele => {
        ele.classList.remove('is-load');
    })
}


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
                myTaskList = {};
                for(let task in res.tasks) {
                    myTaskList[res.tasks[task].taskid] = res.tasks[task]
                }
                taskDisp();
            } else {
                if(res.status === 2) {
                    modal_commonError_moreInfoUpdate('タスクを取得できませんでした。');
                    modal_commonError.show();
                }
            }
        })
        .catch(error => {
            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを取得できませんでした。');
            modal_commonError.show();
            console.error(error);
        });
    
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

        for(let task in myTaskList) {
            if(myTaskList[task].status == 0) {
                data = '<li class="myTaskListItem js-myTaskListItem" data-taskid=' + myTaskList[task].taskid + '>';
                data += '<div class="myTaskListItem__icon js-btn_taskCheck"><img src="/static/common/images/icon_noncheck.svg" alt=""></div>';
                data += '<div class="myTaskListItem__text js-btn_taskUpdate">' + myTaskList[task].taskName + '</div>';
                data += '</li>';
                myTaskList_1.innerHTML += data;
                task1count += 1;
            } else if(myTaskList[task].status == 1) {
                data = '<li class="myTaskListItem">';
                data += '<div class="myTaskListItem__icon"><img src="/static/common/images/icon_send.svg" alt=""></div>';
                data += '<div class="myTaskListItem__text">' + myTaskList[task].taskName + '</div>';
                data += '<div class="myTaskListItem__users">';
                for(let user in myTaskList[task].requestUsers) {
                    data += '<div class="myTaskListItem__user"><img src="' + myTaskList[task].requestUsers[user].iconpath + '" alt=""></div>';
                }
                data += '</div>';
                data += '</li>';
                myTaskList_2.innerHTML += data;
                task2count += 1;
            } else if(myTaskList[task].status == 2) {
                data = '<li class="myTaskListItem">';
                data += '<div class="myTaskListItem__icon"><img src="/static/common/images/icon_check.svg" alt=""></div>';
                data += '<div class="myTaskListItem__text">' + myTaskList[task].taskName + '</div>';
                data += '<div class="myTaskListItem__users">';
                for(let user in myTaskList[task].requestUsers) {
                    data += '<div class="myTaskListItem__user"><img src="' + myTaskList[task].requestUsers[user].iconpath + '" alt=""></div>';
                }
                data += '</div>';
                data += '</li>';
                myTaskList_3.innerHTML += data;
                task3count += 1;
            }
        }

        document.querySelector('#myTaskList-headingOne .task-num').innerHTML = task1count;
        document.querySelector('#myTaskList-headingTwo .task-num').innerHTML = task2count;
        document.querySelector('#myTaskList-headingThree .task-num').innerHTML = task3count;

        initTaskUpdateBtn();
    }
}
getMyTaskList_and_disp();

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
                        userListElement.innerHTML += '<li class="add_finduser cursor-pointer" data-username=' + finduser['username'] + ' data-iconpath=' + finduser['iconpath'] + '>' + finduser['username'] + '<img src="/static/home/images/icon_add_circle.png" class="addPlus"></li>'
                    })
                    const finduserElements = document.querySelectorAll('#modal_todoSelectRequest section ol .add_finduser')
                    finduserElements.forEach((ele) => {
                        ele.addEventListener('click', (e) => {
                            todoCreate_requestUsers[ele.dataset.username] = ele.dataset.iconpath;
                        });
                        ele.style.cssText = 'background-image: url(' + ele.dataset.iconpath + ')'
                    })
                } else {
                    userListElement.innerHTML = '<p>ユーザが見つかりませんでした。</p>';
                }
            } else {
                userListElement.innerHTML = '<p>ユーザが見つかりませんでした。</p>';
            }
        })
        .catch(error => {
            const userListElement = document.querySelector('#modal_todoSelectRequest section ol');
            userListElement.innerHTML = '<p>サーバーでエラーが起きたためユーザを見つけられませんでした。</p>';
            console.error(error);
        });
});


/* ----------------------------
依頼者一覧画面での処理
----------------------------- */
document.getElementById('btn_todoRequestUserList').addEventListener('click', (e) => {
    e.preventDefault();
    
    const disp = () => {
        const userlistElement = document.querySelector('#modal_todoListRequest section ol');
        userlistElement.innerHTML = '';
        if(Object.keys(todoCreate_requestUsers).length != 0) {
            for(let user in todoCreate_requestUsers) {
                userlistElement.innerHTML += '<li class="remove_finduser cursor-pointer" data-username=' + user + ' data-iconpath=' + todoCreate_requestUsers[user] + '>' + user + '<img src="/static/home/images/icon_do_not_disturb.png" class="addPlus"></li>'
            }
            const userElements = document.querySelectorAll('#modal_todoListRequest section ol .remove_finduser')
            userElements.forEach((ele) => {
                ele.addEventListener('click', (e) => {
                    delete todoCreate_requestUsers[ele.dataset.username];
                    disp();
                });
                ele.style.cssText = 'background-image: url(' + ele.dataset.iconpath + ')';
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
// btn
const btn_todoSelectBocchi = document.getElementById('btn_todoSelectBocchi');
const btn_todoSelectRequest = document.getElementById('btn_todoSelectRequest');
const btn_todoSelectRequest_numCollect = document.getElementById('btn_todoSelectRequest_numCollect');

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


})();

// メモ欄の文字制限
form_todoCreate.note.addEventListener('keyup', function() {
    form_todoCreate.querySelector('.note-limit .num').textContent = 300 - form_todoCreate.note.value.length
});

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
    for(var i=0; i < form_todoCreate.importance.length; i++){
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

    fetch('/todo/create/', sendOption)
        .then(res => {
            offLoadingVisual();

            return res.json();
        })
        .then((res) => {
            if (res.result) {
                todoCreate_modalClose();
                modal_todoCreate_success.show();
                todoCreateFormReset();
                getMyTaskList_and_disp();
            } else {
                if (res.status == 1) {
                    todoCreate_modalClose();
                    modal_todoCreate_failed.show();
                    todoCreate_inputError(res.error);
                } else if (res.status == 2) {
                    todoCreate_modalClose();
                    modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを作成できませんでした。');
                    modal_commonError.show();
                    todoCreateFormReset();
                }
            }
        })
        .catch(error => {
            todoCreate_modalClose();
            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを作成できませんでした。');
            modal_commonError.show();
            todoCreateFormReset();
            console.error(error);

            offLoadingVisual();
        });
    
    const todoCreate_modalClose = () => {
        modal_todoSelectBocchi.hide();
        modal_todoSelectRequest.hide();
        modal_todoCreate_numCheck.hide();
    }

    const offLoadingVisual = () => {
        btn_todoSelectBocchi.classList.remove('is-load');
        btn_todoSelectRequest.classList.remove('is-load');
        btn_todoSelectRequest_numCollect.classList.remove('is-load');
    }

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
btn_todoSelectBocchi.addEventListener("click", function(e) {
    e.preventDefault();
    btn_todoSelectBocchi.classList.add('is-load');

    todoCreate_sendData(isBochi=true);
});

// 依頼者を選択する場合
btn_todoSelectRequest.addEventListener("click", function(e) {
    e.preventDefault();

    if(Object.keys(todoCreate_requestUsers).length == 0) {
        modal_todoSelectRequest.hide();
        modal_todoCreate_numCheck.show();
    } else {
        btn_todoSelectRequest.classList.add('is-load');
        todoCreate_sendData(isBochi=false);
    }
});
btn_todoSelectRequest_numCollect.addEventListener("click", function(e) {
    e.preventDefault();

    btn_todoSelectRequest_numCollect.classList.add('is-load');
    todoCreate_sendData(isBochi=false);
});

/* ----------------------------
タスク更新処理
----------------------------- */
// btn
const btn_todoUpdate = document.getElementById('js-btn_todoUpdate');
const btn_todoDelete = document.getElementById('js-btn_todoDelete');


// 更新フォームの生成処理
const makeTaskUpdateForm = (taskid) => {
    const task = myTaskList[taskid];

    data = ''
    data += '<input type="hidden" name="taskid" value="' + taskid + '">';
    data += '<!-- タスク名 -->';
    data += '<tr>';
    data += '<th>タスク名</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td><input type="text" class="form-control" name="taskName" value="' + task.taskName + '"></td>';
    data += '</tr>';
    data += '<!-- エラーダイアログ -->';
    data += '<tr>';
    data += '<th class="error task-error"></th>';
    data += '</tr>';
    data += '';
    data += '<!-- 期限日 -->';
    data += '<tr>';
    data += '<th>期限日</th>';
    data += '<td>';
    data += '<div class="btn-group d-flex justify-content-between mt-2">';
    data += '<!-- 年 -->';
    data += '<div class="dropdown">';
    data += '<select class="year btn btn-light" name="year">';
    data += '</select>';
    data += '</div>';
    data += '<p class="date">年</p>';
    data += '';
    data += '<!-- 月 -->';
    data += '<div class="dropdown">';
    data += '<select class="month btn btn-light" name="month">';
    data += '</select>';
    data += '</div>';
    data += '<p class="date">月</p>';
    data += '';
    data += '<!-- 日 -->';
    data += '<div class="dropdown">';
    data += '<select class="day btn btn-light" name="day">';
    data += '</select>';
    data += '</div>';
    data += '<p class="date">日</p>';
    data += '</div>';
    data += '</td>';
    data += '</tr>';
    data += '<!-- エラーダイアログ -->';
    data += '<tr>';
    data += '<th class="error deadline-error"></th>';
    data += '</tr>';
    data += '';
    data += '<!-- 重要度 -->';
    data += '<tr>';
    data += '<th>重要度</th>';
    data += '<td>';
    data += '<!-- それぞれラジオボタンで実装 -->';
    data += '<div class="d-flex justify-content-between">';
    data += '<div class="form-check form-check-inline" style="justify-content:start;">';
    data += '<input class="form-check-input" type="radio" name="importance" ' + (task.importance == 0 ? 'checked' : '') + '>';
    data += '<label class="form-check-label">高</label>';
    data += '</div>';
    data += '<div class="form-check form-check-inline" style="justify-content: center;">';
    data += '<input class="form-check-input" type="radio" name="importance" ' + (task.importance == 1 ? 'checked' : '') + '>';
    data += '<label class="form-check-label">中</label>';
    data += '</div>';
    data += '<div class="form-check form-check-inline">';
    data += '<input class="form-check-input" type="radio" name="importance" ' + (task.importance == 2 ? 'checked' : '') + '>';
    data += '<label class="form-check-label">低</label>';
    data += '</div>';
    data += '</div>';
    data += '</td>';
    data += '</tr>';
    data += '<!-- エラーダイアログ 重要度にエラーはないので空白-->';
    data += '<tr>';
    data += '<th class="error importance-error"></th>';
    data += '</tr>';
    data += '';
    data += '<!-- メモ -->';
    data += '<tr>';
    data += '<th>メモ</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td>';
    data += '<textarea class="input-memo" cols="35" rows="10" name="note">' + task.note + '</textarea>';
    data += '<!-- 文字数制限 -->';
    data += '<p class="note-limit">あと<span class="num">' + (300 - task.note.length) + '</span>文字まで入力できます</p>';
    data += '</td>';
    data += '</tr>';
    data += '<!-- エラーダイアログ -->';
    data += '<tr>';
    data += '<th class="error note-error"></th>';
    data += '</tr>';
    data += '';

    if (task.requestUsers.length <= 0) {
        data += '<!-- 完了済み -->';
        data += '<tr>';
        data += '<th style="word-break: keep-all;">完了済にする</th>';
        data += '<td>';
        data += '<div class="form-check">';
        data += '<input class="form-check-input" type="checkbox" name="check">';
        data += '<label class="form-check-label">';
        data += '</label>';
        data += '</div>';
        data += '</td>';
        data += '</tr>';
    } else {
        data += '<!-- 一次チェック -->';
        data += '<tr>';
        data += '<th style="word-break: keep-all;">1次チェック</th>';
        data += '<td>';
        data += '<div class="form-check">';
        data += '<input class="form-check-input" type="checkbox" name="check">';
        data += '<label class="form-check-label">';
        data += '</label>';
        data += '</div>';
        data += '</td>';
        data += '</tr>';
    }

    form_todoUpdate.querySelector('.js-ele_todoUpdateTable').innerHTML = data;

    // 期限日の処理
    let optionLoop, this_day, this_month, this_year, update_day;
    update_day = new Date(task.deadline);
    this_year = update_day.getFullYear();
    this_month = update_day.getMonth() + 1;
    this_day = update_day.getDate();

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
        return form_todoUpdate.querySelector(d_class).innerHTML = opt;
    };

    optionLoop(2022, this_year + 10, '.year', this_year);
    optionLoop(1, 12, '.month', this_month);
    optionLoop(1, 31, '.day', this_day);
    
    // メモ欄の文字制限
    form_todoUpdate.note.addEventListener('keyup', function() {
        form_todoUpdate.querySelector('.note-limit .num').textContent = 300 - form_todoUpdate.note.value.length
    });
}

// 一次チェックをするか、完了済みにするか。
const todoUpdate_taskCheck = (taskid) => {
    const task = myTaskList[taskid];

    if (task.requestUsers.length <= 0) {
        // 依頼者が一人もいない場合
        modal_todoUpdate_completeCheck.show();
        
        const btn_todoCompleteOne = document.getElementById('js-btn_todoCompleteOne')
        btn_todoCompleteOne.addEventListener('click', (e) => {
            e.preventDefault();
            btn_todoCompleteOne.classList.add('is-load');

            const body = new URLSearchParams()
            body.append('taskid', taskid);

            const sendOption = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                },
                body: body
            };

            fetch('/todo/complete/', sendOption)
                .then(res => {
                    btn_todoCompleteOne.classList.remove('is-load');
                    return res.json();
                })
                .then((res) => {
                    if (res.result) {
                        modal_todoUpdate_completeCheck.hide();
                        getMyTaskList_and_disp();
                    } else {
                        modal_todoUpdate_completeCheck.hide();
                        modal_commonError_moreInfoUpdate('エラーが起きたため、タスクを完了できませんでした。');
                        modal_commonError.show();
                    }
                })
                .catch(error => {
                    modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを完了できませんでした。');
                    modal_commonError.show();
                    console.error(error);

                    btn_todoCompleteOne.classList.remove('is-load');
                });
        });

    } else {
        // 依頼者が複数人いる場合
        makeFirstCheckForm(taskid);
        modal_todoFirstCheck.show();
    }
}

// 
const initTaskUpdateBtn = () => {
    const btn_taskUpdate = document.querySelectorAll('.js-btn_taskUpdate')
    btn_taskUpdate.forEach(ele => {
        ele.addEventListener('click', (e) => {
            taskid = e.target.closest('.js-myTaskListItem').dataset.taskid;
            makeTaskUpdateForm(taskid);
            modal_todoUpdate.show();
        })
    });

    const btn_taskCheck = document.querySelectorAll('.js-btn_taskCheck');
    btn_taskCheck.forEach(ele => {
        ele.addEventListener('click', (e) => {
            taskid = e.target.closest('.js-myTaskListItem').dataset.taskid;
            todoUpdate_taskCheck(taskid)
        })
    });
}

// タスク更新のデータを送る
btn_todoUpdate.addEventListener('click', (e) => {
    e.preventDefault();
    btn_todoUpdate.classList.add('is-load');

    const body = new URLSearchParams()

    let taskid = form_todoUpdate.taskid.value;
    body.append('taskid', taskid);

    let taskName = form_todoUpdate.taskName.value;
    body.append('taskName', taskName);

    let year = form_todoUpdate.year.value;
    let month = form_todoUpdate.month.value;
    let day = form_todoUpdate.day.value;
    let deadline = year + '-' + month + '-' + day + ' 00:00:00';
    body.append('deadline', deadline);

    let importance = 1;
    for(var i=0; i < form_todoUpdate.importance.length-1; i++){
        if(form_todoUpdate.importance[i].checked){
            importance = i
        }
    }
    body.append('importance', importance);

    let note = form_todoUpdate.note.value;
    body.append('note', note);

    let check = form_todoUpdate.check;

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: body
    };

    fetch('/todo/update/', sendOption)
        .then(res => {
            btn_todoUpdate.classList.remove('is-load');
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                modal_todoUpdate.hide();
                if(check.checked) {
                    todoUpdate_taskCheck(taskid);
                } else {
                    modal_todoUpdate_success.show();
                    getMyTaskList_and_disp();
                }
            } else {
                if (res.status == 1) {
                    todoUpdate_inputError(res.error);
                } else if (res.status == 2) {     
                    modal_todoUpdate.hide();
                    modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを更新できませんでした。');
                    modal_commonError.show();
                }
            }
        })
        .catch(error => {
            modal_todoUpdate.hide();
            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを更新できませんでした。');
            modal_commonError.show();
            console.error(error);

            btn_todoUpdate.classList.remove('is-load');
        });
    
    const todoUpdate_inputError = (error) => {
        error.taskName ? form_todoUpdate.querySelector('.task-error').textContent = error.taskName : form_todoUpdate.querySelector('.task-error').textContent = "";
        error.deadline ? form_todoUpdate.querySelector('.deadline-error').textContent = error.deadline : form_todoUpdate.querySelector('.deadline-error').textContent = "";
        error.importance ? form_todoUpdate.querySelector('.importance-error').textContent = error.importance : form_todoUpdate.querySelector('.importance-error').textContent = "";
        error.note ? form_todoUpdate.querySelector('.note-error').textContent = error.note : form_todoUpdate.querySelector('.note-error').textContent = "";
    }
})

// タスクの削除をする
btn_todoDelete.addEventListener('click', (e) => {
    e.preventDefault();
    btn_todoDelete.classList.add('is-load');

    const body = new URLSearchParams()

    let taskid = form_todoUpdate.taskid.value;
    body.append('taskid', taskid);

    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: body
    };

    fetch('/todo/delete/', sendOption)
        .then(res => {
            btn_todoDelete.classList.remove('is-load');
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                modal_todoDelete_check.hide();
                modal_todoDelete_success.show();
                getMyTaskList_and_disp();
            } else {
                modal_todoDelete_check.hide();
                modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを削除できませんでした。');
                modal_commonError.show();
            }
        })
        .catch(error => {
            modal_todoDelete_check.hide();
            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを削除できませんでした。');
            modal_commonError.show();
            console.error(error);

            btn_todoDelete.classList.remove('is-load');
        });
})

/* ----------------------------
一次チェックモーダルでの処理
----------------------------- */
// btn
const btn_todoFirstCheck = document.getElementById('js-btn_todoFirstCheck');

// 一次チェックフォームの生成
const makeFirstCheckForm = (taskid) => {
    data = '';
    data += '<input type="hidden" name="taskid" value="' + taskid + '">';
    data += '<!-- 画像選択 -->';
    data += '<tr>';
    data += '<th>画像</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td>';
    data += '<label for="todo_firstCheckImg" class="photo cursor-pointer">';
    data += '<img src="/static/home/images/icon_photo.png">';
    data += '</label>';
    data += '<input type="file" name="img" accept=".jpg, .png" id="todo_firstCheckImg">';
    data += '<span class="text-checkImg">jpg、又はpng形式(5MBまで)</span>';
    data += '</td>';
    data += '</tr>';
    data += '<!-- エラーダイアログ -->';
    data += '<tr>';
    data += '<th class="error img-error"></th>';
    data += '</tr>';
    data += '';
    data += '<!-- 動画選択 -->';
    data += '<tr>';
    data += '<th>動画</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td>';
    data += '<label for="todo_firstCheckMovie" class="photo cursor-pointer">';
    data += '<img src="/static/home/images/icon_movie.png">';
    data += '</label>';
    data += '<input type="file" name="movie" accept=".mp4, .MPEG4, .MOV" id="todo_firstCheckMovie">';
    data += '<span class="text-checkMovie">2分20秒以下、かつ512MB以下まで</span>';
    data += '</td>';
    data += '</tr>';
    data += '<!-- エラーダイアログ -->';
    data += '<tr>';
    data += '<th class="error movie-error"></th>';
    data += '</tr>';
    data += '';
    data += '<!-- メモ -->';
    data += '<tr>';
    data += '<th>説明</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td>';
    data += '<textarea class="input-memo" cols="35" rows="10" name="description"></textarea>';
    data += '<!-- 文字数制限 -->';
    data += '<p class="note-limit">あと<span class="num">300</span>文字まで入力できます</p>';
    data += '</td>';
    data += '</tr>';
    data += '<tr>';
    data += '<th class="error description-error"></th>';
    data += '</tr>';

    form_todoFirstCheck.querySelector('.js-ele_todoFirstCheckTable').innerHTML = data;

    // formでアイコンが選択されたら表示する処理
    document.getElementById('todo_firstCheckImg').addEventListener('change', (e) => {
        let fileList = e.target.files;
        let file = fileList[0];
        form_todoFirstCheck.querySelector('.text-checkImg').textContent = file.name;
    });
    document.getElementById('todo_firstCheckMovie').addEventListener('change', (e) => {
        let fileList = e.target.files;
        let file = fileList[0];
        form_todoFirstCheck.querySelector('.text-checkMovie').textContent = file.name;
    });

    // メモ欄の文字制限
    form_todoFirstCheck.description.addEventListener('keyup', function() {
        form_todoFirstCheck.querySelector('.note-limit .num').textContent = 300 - form_todoFirstCheck.description.value.length
    });
}

// 一次チェックする
btn_todoFirstCheck.addEventListener('click', (e) => {
    e.preventDefault();
    btn_todoFirstCheck.classList.add('is-load');

    const body = new FormData()

    let taskid = form_todoFirstCheck.taskid.value;
    body.append('taskid', taskid);

    let img = form_todoFirstCheck.img.files[0];
    if (img) { 
        body.append('img', img); 
    } else {
        body.append('img', ''); 
    }

    let movie = form_todoFirstCheck.movie.files[0];
    if (movie) { 
        body.append('movie', movie); 
    } else {
        body.append('movie', ''); 
    }
    
    let description = form_todoFirstCheck.description.value;
    body.append('description', description);

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

    fetch('/todo/firstCheck/', sendOption)
        .then(res => {
            btn_todoFirstCheck.classList.remove('is-load');
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                modal_todoFirstCheck.hide();
                modal_todoUpdate_send.show();
                getMyTaskList_and_disp();
            } else {
                if (res.status == 1) {
                    todoFirstCheck_inputError(res.error);
                } else if (res.status == 2) {
                    modal_todoFirstCheck.hide();
                    modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、一次チェックできませんでした。');
                    modal_commonError.show();
                }
            }
        })
        .catch(error => {
            modal_todoFirstCheck.hide();
            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、一次チェックできませんでした。');
            modal_commonError.show();
            console.error(error);

            btn_todoFirstCheck.classList.remove('is-load');
        });
    
    const todoFirstCheck_inputError = (error) => {
        error.img ? form_todoFirstCheck.querySelector('.img-error').textContent = error.img : form_todoFirstCheck.querySelector('.img-error').textContent = "";
        error.movie ? form_todoFirstCheck.querySelector('.movie-error').textContent = error.movie : form_todoFirstCheck.querySelector('.movie-error').textContent = "";
        error.description ? form_todoFirstCheck.querySelector('.description-error').textContent = error.description : form_todoFirstCheck.querySelector('.description-error').textContent = "";
    }
})