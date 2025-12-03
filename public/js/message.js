document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("mensagem");
    const closeBtn = document.querySelector('.close-button');

    closeBtn.onclick = () => modal.style.display = 'none';
})  
