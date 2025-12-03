let currentMatricula = null;

document.addEventListener("DOMContentLoaded", () => {
    const editBtns = document.querySelectorAll(".editar_notas");
    const modal = document.getElementById("modal_notas");
    const saveBtn = document.getElementById("save_grade");
    const closeBtn = document.querySelector(".close-button");

    const g1 = document.getElementById("nota_g1");
    const g2 = document.getElementById("nota_g2");

    [g1, g2].forEach(input => {
    input.addEventListener("input", () => {
        let v = Number(input.value);
        if (v > 10) input.value = 10;
        if (v < 0) input.value = 0;
        });
    });


    editBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            currentMatricula = btn.dataset.matriculaId; // store id
            modal.classList.add("active");
        });
    });

    saveBtn.addEventListener("click", async () => {
        const g1 = document.getElementById("nota_g1").value;
        const g2 = document.getElementById("nota_g2").value;

        await fetch("/update_nota", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                matriculaId: currentMatricula,
                g1,
                g2
            })
        });

        modal.classList.remove("active");
        window.location.reload();
    });

    closeBtn.onclick = () => {modal.classList.remove("active");}
});

