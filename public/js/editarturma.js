document.addEventListener("DOMContentLoaded", () => {
    const editBtns = document.querySelectorAll("editar_notas");
    const modal = document.getElementById("modal_notas");

    editBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modal.style.display = "block";
            console.log("click")
        });
    });
});