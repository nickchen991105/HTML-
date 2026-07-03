document.addEventListener("DOMContentLoaded", function(){
    let Nick = document.getElementById('tools');
    let output = document.getElementById('agg1')
    Nick.addEventListener('click', function(){
        output.innerHTML = '<h1 style="font-size: 100px; color: #FF2D2D" id="${agg1}">不要亂按!!</h1>'
    })
})







