function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

const form_ceckPassword = document.querySelector("#form_checkPassword");
form_ceckPassword.addEventListener("submit", function(e) {
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

    fetch( form_ceckPassword.url.value, sendOption )
    .then(res => { 
        console.log(res.json());
    });
});