document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("mensagem");

    if (modal) {
        modal.addEventListener("click", () => {
            modal.style.display = "none";
        })
    };
})  
