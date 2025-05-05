const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

// Highlight drag events
["dragenter", "dragover"].forEach(event => {
    dropZone.addEventListener(event, e => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });
});
["dragleave", "drop"].forEach(event => {
    dropZone.addEventListener(event, e => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
    });
});

// Drop to input
dropZone.addEventListener("drop", e => {
    fileInput.files = e.dataTransfer.files;
    handleUpload(fileInput.files[0]);
});

// Click to select
dropZone.addEventListener("click", () => fileInput.click());

// Auto upload
fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        handleUpload(fileInput.files[0]);
    }
});

function showStatus(message, type = "success") {
    const box = document.getElementById("uploadStatus");
    box.textContent = message;
    box.className = type;
    setTimeout(() => {
        box.className = "hidden";
    }, 4000);
}

function handleUpload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    const progress = document.getElementById("uploadProgress");
    const bar = document.getElementById("uploadBar");

    xhr.open("POST", "/upload");

    // Mostrar progresso
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            bar.style.width = `${percent}%`;
        }
    };

    // Fim do upload
    xhr.onload = () => {
        progress.style.display = "none";
        bar.style.width = "0%";

        if (xhr.status === 200) {
            showStatus("✅ Upload concluído com sucesso!", "success");
            fetchFileList();
        } else {
            showStatus("❌ Erro no upload.", "error");
        }
    };

    xhr.onerror = () => {
        progress.style.display = "none";
        bar.style.width = "0%";
        showStatus("⚠️ Falha na conexão com o servidor.", "error");
    };

    progress.style.display = "block";
    xhr.send(formData);
}


async function fetchFileList() {
    try {
        const res = await fetch("/storage/files/");
        if (!res.ok) throw new Error("Erro ao buscar arquivos.");
        const files = await res.json();

        fileList.innerHTML = "";

        files.forEach(({ name, url }) => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            link.href = url;
            link.textContent = name;
            link.target = "_blank";
            li.appendChild(link);
            fileList.appendChild(li);
        });
    } catch (err) {
        showStatus("❌ Falha ao carregar lista de arquivos.", "error");
    }
}

fetchFileList();
