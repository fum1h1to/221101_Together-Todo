// modalの要素取得
const modal_todoOtherTaskDetail = new bootstrap.Modal(document.getElementById('modal_todoOtherTaskDetail'), modalOption);

// このページ内で使う変数
const otherTaskList = [] // 他人のタスクを保持する配列
const dayOfWeekStr = [ "日", "月", "火", "水", "木", "金", "土" ]

// 並び替えの選択
document.querySelector('.js-otherTask_sortMenu').onchange = e => {
    makeOtherTaskListElement(e.target.selectedIndex);
}


/* ----------------------------
タスクの取得処理
----------------------------- */
const getOtherTaskList = () => {
    const sendOption = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
    };

    fetch('/request/list/', sendOption)
        .then(res => {
            return res.json();
        })
        .then((res) => {
            if (res.result) {
                otherTaskList.splice(0)
                for(let task in res.tasks) {
                    otherTaskList.push(res.tasks[task]);
                }
                makeOtherTaskListElement(0);
            } else {
                const ele_otherTaskList = document.getElementById('accordion-otherTaskList');
                ele_otherTaskList.innerHTML = '<div class="otherTaskList__titleWrap"><p>エラーが起きたため、タスクを取得できませんでした。</p></div>';

                modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを取得できませんでした。');
                modal_commonError.show();
            }
        })
        .catch(error => {
            const ele_otherTaskList = document.getElementById('accordion-otherTaskList');
            ele_otherTaskList.innerHTML = '<div class="otherTaskList__titleWrap"><p>エラーが起きたため、タスクを取得できませんでした。</p></div>';

            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、タスクを取得できませんでした。');
            modal_commonError.show();
            console.error(error);
        });
}

const makeOtherTaskListElement = (sortNum) => {
    // 画面上部のタスク数の初期化
    document.querySelector('.js-otherTaskNum .js-num').textContent = otherTaskList.length;

    const ele_otherTaskList = document.getElementById('accordion-otherTaskList');

    if (otherTaskList.length == 0) {
        ele_otherTaskList.innerHTML = '<div class="otherTaskList__titleWrap"><p>チェックを依頼されたタスクはありません。</p></div>';
        return;
    }

    // sortNumの値に応じて要素を生成する
    ele_otherTaskList.innerHTML = '';

    switch(sortNum) {
        case 0: // 日付順
            (function () {
                let tmpTime = new Set();
                let tmpList = {}
                for (let task in otherTaskList) {
                    let time = new Date(otherTaskList[task].deadline);
                    let f_time = Number(time.getFullYear().toString().padStart(2, "0") + time.getMonth().toString().padStart(2, "0") + time.getDate().toString().padStart(2, "0"))
                    tmpTime.add(f_time)
                    if (tmpList[f_time]) {
                        tmpList[f_time].push(otherTaskList[task]);
                    } else {
                        tmpList[f_time] = []
                        tmpList[f_time].push(otherTaskList[task]);
                    }
                }

                const sortedTime = Array.from(tmpTime).sort((a, b) => a - b);

                for (let time in sortedTime) {
                    let time_str = sortedTime[time].toString()
                    let time_date = new Date(time_str.slice(0, 4), time_str.slice(4, 6), time_str.slice(6));

                    let date_text_color = '';
                    if (time_date.getDay() == 0) {
                        date_text_color = 'is-red'
                    } else if (time_date.getDay() == 6) {
                        date_text_color = 'is-blue'
                    }

                    data = '';
                    data += '<div class="accordion-item">';
                    data += '<h2 class="accordion-header" id="otherTaskList-heading' + time_str + '">';
                    data += '<div class="accordion-button" data-bs-toggle="collapse" data-bs-target="#otherTaskList-collapse' + time_str + '"';
                    data += 'aria-expanded="true" aria-controls="otherTaskList-collapse' + time_str + '">';
                    data += '<span class="date ' + date_text_color + '">' + (time_date.getMonth() + 1) + '月' + time_date.getDate() + '日(' + dayOfWeekStr[time_date.getDay()] + ')</span>　(' + tmpList[sortedTime[time]].length + ')';
                    data += '</div>';
                    data += '</h2>';
                    data += '<div id="otherTaskList-collapse' + time_str + '" class="accordion-collapse collapse show"';
                    data += 'aria-labelledby="otherTaskList-heading' + time_str + '">';
                    data += '<div class="accordion-body">';
                    data += '<ul class="otherTaskList">';

                    for (let ori_task in tmpList[sortedTime[time]]) {
                        const task = tmpList[sortedTime[time]][ori_task];
                        data += '<li class="otherTaskListItem js-btn_otherTaskDetail" data-taskid=' + task.taskid + '>';
                        data += '<div class="otherTaskListItem__icon"><img src="/static/common/images/icon_noncheck.svg" alt=""></div>';
                        data += '<div class="otherTaskListItem__text">' + task.taskName;
                        data += '<img class="otherTaskListItem__user" src="' + Object.values(task.user) + '" alt="">';
                        data += '</div>';
                        data += '</li>';
                    }

                    data += '</ul>';
                    data += '</div>';
                    data += '</div>';
                    data += '</div>';

                    ele_otherTaskList.innerHTML += data;
                }
            })();
        
            break;
        case 1: // 重要度
            (function () {
                let tmpList = {0: [], 1: [], 2: []}
                for (let task in otherTaskList) {
                    let imp = otherTaskList[task].importance;
                    tmpList[imp].push(otherTaskList[task]);
                }

                for (let imp = 0; imp < 3; imp++) {
                    let impTxt = '';
                    let imp_text_color = '';
                    if (imp == 0) {
                        impTxt = '高';
                        imp_text_color = 'is-red';
                    } else if (imp == 1) {
                        impTxt = '中'
                    } else if (imp == 2) {
                        impTxt = '低'
                        imp_text_color = 'is-blue';
                    } 

                    data = '';
                    data += '<div class="accordion-item">';
                    data += '<h2 class="accordion-header" id="otherTaskList-heading' + imp + '">';
                    data += '<div class="accordion-button" data-bs-toggle="collapse" data-bs-target="#otherTaskList-collapse' + imp + '"';
                    data += 'aria-expanded="true" aria-controls="otherTaskList-collapse' + imp + '">';
                    data += '<span class="importance ' + imp_text_color + '">' + impTxt + '</span>　(' + tmpList[imp].length + ')';
                    data += '</div>';
                    data += '</h2>';
                    data += '<div id="otherTaskList-collapse' + imp + '" class="accordion-collapse collapse show"';
                    data += 'aria-labelledby="otherTaskList-heading' + imp + '">';
                    data += '<div class="accordion-body">';
                    data += '<ul class="otherTaskList">';

                    for (let ori_task in tmpList[imp]) {
                        const task = tmpList[imp][ori_task];
                        data += '<li class="otherTaskListItem js-btn_otherTaskDetail" data-taskid=' + task.taskid + '>';
                        data += '<div class="otherTaskListItem__icon"><img src="/static/common/images/icon_noncheck.svg" alt=""></div>';
                        data += '<div class="otherTaskListItem__text">' + task.taskName;
                        data += '<img class="otherTaskListItem__user" src="' + Object.values(task.user) + '" alt="">';
                        data += '</div>';
                        data += '</li>';
                    }

                    data += '</ul>';
                    data += '</div>';
                    data += '</div>';
                    data += '</div>';

                    ele_otherTaskList.innerHTML += data;
                }
            })();

            break;
        case 2: // タイトル順
            (function () {
                let tmpList = Object.assign([], otherTaskList);
                tmpList.sort((a, b) => {
                    if(a.taskName < b.taskName) return -1;
                    else if(a.taskName > b.taskName) return 1;
                    return 0;
                });

                data = '';
                data += '<div class="otherTaskList__titleWrap">'
                data += '<ul class="otherTaskList">';

                for (let ori_task in tmpList) {
                    const task = tmpList[ori_task];
                    data += '<li class="otherTaskListItem js-btn_otherTaskDetail" data-taskid=' + task.taskid + '>';
                    data += '<div class="otherTaskListItem__icon"><img src="/static/common/images/icon_noncheck.svg" alt=""></div>';
                    data += '<div class="otherTaskListItem__text">' + task.taskName;
                    data += '<img class="otherTaskListItem__user" src="' + Object.values(task.user) + '" alt="">';
                    data += '</div>';
                    data += '</li>';
                }

                data += '</ul>';
                data += '</div>';
                data += '</div>';
                data += '</div>';
                data += '</div>';

                ele_otherTaskList.innerHTML += data;
                
            })();
            
            break;
        case 3: // 依頼者
            (function () {
                let tmpUsers = new Set();
                let tmpList = {}
                for (let task in otherTaskList) {
                    let user = otherTaskList[task].user
                    let username = Object.keys(user).toString();

                    tmpUsers.add(username)
                    if (tmpList[username]) {
                        tmpList[username].push(otherTaskList[task]);
                    } else {
                        tmpList[username] = []
                        tmpList[username].push(otherTaskList[task]);
                    }
                }

                const sortedUsers = Array.from(tmpUsers).sort((a, b) => {
                    if(a < b) return -1;
                    else if(a > b) return 1;
                    return 0;
                });

                for (let username in sortedUsers) {
                    let username_str = sortedUsers[username].toString()

                    data = '';
                    data += '<div class="accordion-item">';
                    data += '<h2 class="accordion-header" id="otherTaskList-heading-' + username_str + '">';
                    data += '<div class="accordion-button" data-bs-toggle="collapse" data-bs-target="#otherTaskList-collapse-' + username_str + '"';
                    data += 'aria-expanded="true" aria-controls="otherTaskList-collapse-' + username_str + '">';
                    data += '<span class="username">' + username_str + '</span>　(' + tmpList[sortedUsers[username]].length + ')';
                    data += '</div>';
                    data += '</h2>';
                    data += '<div id="otherTaskList-collapse-' + username_str + '" class="accordion-collapse collapse show"';
                    data += 'aria-labelledby="otherTaskList-heading-' + username_str + '">';
                    data += '<div class="accordion-body">';
                    data += '<ul class="otherTaskList">';

                    for (let ori_task in tmpList[sortedUsers[username]]) {
                        const task = tmpList[sortedUsers[username]][ori_task];
                        data += '<li class="otherTaskListItem js-btn_otherTaskDetail" data-taskid=' + task.taskid + '>';
                        data += '<div class="otherTaskListItem__icon"><img src="/static/common/images/icon_noncheck.svg" alt=""></div>';
                        data += '<div class="otherTaskListItem__text">' + task.taskName;
                        data += '<img class="otherTaskListItem__user" src="' + Object.values(task.user) + '" alt="">';
                        data += '</div>';
                        data += '</li>';
                    }

                    data += '</ul>';
                    data += '</div>';
                    data += '</div>';
                    data += '</div>';

                    ele_otherTaskList.innerHTML += data;
                }
            })();
    
            break;
        default:
            break;
    }

    const btn_otherTaskDetail = document.querySelectorAll('.js-btn_otherTaskDetail');
    btn_otherTaskDetail.forEach(ele => {
        ele.addEventListener('click', (e) => {
            taskid = ele.dataset.taskid;
            makeOtherTaskDetailModal(taskid);
            modal_todoOtherTaskDetail.show()
        })
    });

}

getOtherTaskList();

/* ----------------------------
タスクの詳細画面
----------------------------- */
const makeOtherTaskDetailModal = (taskid) => {
    const task = otherTaskList.find((task) => { return task.taskid === taskid });
    
    const ele_todoOtherTaskDetailTable = document.getElementById('js-ele_todoOtherTaskDetailTable');
    
    let time_date = new Date(task.deadline);

    let imp = task.importance
    let impTxt = '';
    if (imp == 0) {
        impTxt = '高';
    } else if (imp == 1) {
        impTxt = '中'
    } else if (imp == 2) {
        impTxt = '低'
    } 

    data = ''
    data += '<input id="js-otherTaskDetail_taskid" type="hidden" value="' + task.taskid + '">'
    data += '<!-- タスク名 -->';
    data += '<tr>';
    data += '<th>タスク名</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td class="userName">' + task.taskName + '</td>';
    data += '</td>';
    data += '</tr>';
    data += '';
    data += '<!-- 作成者 -->';
    data += '<tr>';
    data += '<th>作成者</th>';
    data += '<!-- 入力フォーム -->';
    data += '<td class="userName">' + Object.keys(task.user) + '<img class="human" src="' + Object.values(task.user) + '"></td>';
    data += '</td>';
    data += '</tr>';
    data += '';
    data += '<!-- 期限日 -->';
    data += '<tr>';
    data += '<th>期限日</th>';
    data += '<td class="date">' + time_date.getFullYear() + '年' + (time_date.getMonth() + 1) + '月' + time_date.getDate() + '日(' + dayOfWeekStr[time_date.getDay()] + ')</td>';
    data += '</tr>';
    data += '';
    data += '<!-- 重要度 -->';
    data += '<tr>';
    data += '<th>重要度</th>';
    data += '<td class="importance">' + impTxt +'です</td>';
    data += '</tr>';
    data += '';
    data += '<!-- メモ -->';
    data += '<tr>';
    data += '<th>メモ</th>';
    data += '<td>' + task.description +'</td>';
    data += '</tr>';
    data += '';
    data += '<!-- 一次チェック -->';
    data += '<tr>';
    data += '<th>1次チェック</th>';
    data += '<td>1次チェック送信済</td>';
    data += '</tr>';
    data += '';
    if (task.img !== '') {
        data += '<!-- 画像 -->';
        data += '<tr>';
        data += '<th>画像</th>';
        data += '<td>';
        data += '<img src="' + task.img +'">';
        data += '</td>';
        data += '</tr>';
        data += '';
    }
    if (task.movie !== '') {
        data += '<!-- 動画 -->';
        data += '<tr>';
        data += '<th>動画</th>';
        data += '<td>';
        data += '<video src="' + task.movie +'" controls style="width: 100%"></video>';
        data += '</td>';
        data += '</tr>';
    }

    ele_todoOtherTaskDetailTable.innerHTML = data;

}

/* ----------------------------
タスクのチェック
----------------------------- */
const btn_todoOtherTaskCheck = document.getElementById('js-btn_todoOtherTaskCheck')
document.getElementById('js-btn_todoOtherTaskCheck').addEventListener('click', (e) => {
    e.preventDefault();
    btn_todoOtherTaskCheck.classList.add('is-load');

    const tasid = document.getElementById('js-otherTaskDetail_taskid').value;

    const body = new URLSearchParams();
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

    fetch('/request/complete/', sendOption)
        .then(res => {
            btn_todoOtherTaskCheck.classList.remove('is-load');
            return res.json();
        })
        .then((res) => {
            console.log(res);
            if (res.result) {
                getOtherTaskList();
                modal_todoOtherTaskDetail.hide()
            } else {
                modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、完了できませんでした。');
                modal_commonError.show();
            }
        })
        .catch(error => { 
            modal_commonError_moreInfoUpdate('サーバで何かエラーが起きたため、完了できませんでした。');
            modal_commonError.show();
            console.error(error);

            btn_todoOtherTaskCheck.classList.remove('is-load');
        })
})