

// このページ内で使う変数
const otherTaskList = [] // 他人のタスクを保持する配列

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

            }
        })
}

const makeOtherTaskListElement = (sortNum) => {
    // 画面上部のタスク数の初期化
    document.querySelector('.js-otherTaskNum .js-num').textContent = otherTaskList.length;

    // sortNumの値に応じて要素を生成する
    const ele_otherTaskList = document.getElementById('accordion-otherTaskList');
    ele_otherTaskList.innerHTML = '';

    switch(sortNum) {
        case 0: // 日付順
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
            const dayOfWeekStr = [ "日", "月", "火", "水", "木", "金", "土" ]

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
                    data += '<li class="otherTaskListItem">';
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
        
            break;
        case 1: // 重要度
    
            break;
        case 2: // タイトル準
    
            break;
        case 3: // 
    
            break;
        default:
            break;
    }

}

getOtherTaskList();