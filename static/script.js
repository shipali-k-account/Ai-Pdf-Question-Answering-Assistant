
const pdfInput = document.getElementById("pdfInput");
const status = document.getElementById("status");
const chat = document.getElementById("chat");
const questionInput = document.getElementById("questionInput");
const questionForm = document.getElementById("questionForm");
const sendButton = document.getElementById("sendButton");
const notice = document.getElementById("notice");

let pdfUploaded = false;
let busy = false;

// Display a message in the chat
function addMessage(text, type, pages = []) {
    const message = document.createElement("div");
    message.className = `message ${type}`;

    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = type === "user" ? "YOU" : "DOCUMIND AI";

    const content = document.createElement("div");
    content.textContent = text;

    message.append(label, content);

    if (type === "assistant" && pages.length) {
        const source = document.createElement("div");
        source.style.marginTop = "10px";
        source.style.color = "#7565ed";
        source.style.fontSize = "11px";
        source.textContent = "PDF pages: " + pages.join(", ");
        message.appendChild(source);
    }

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;

    return message;
}

// Enable or disable the question box
function updateControls() {
    questionInput.disabled = !pdfUploaded || busy;
    sendButton.disabled =
        !pdfUploaded || busy || !questionInput.value.trim();
}

// Upload PDF to Flask
pdfInput.addEventListener("change", async () => {
    const file = pdfInput.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
        notice.textContent = "Please select a PDF file.";
        return;
    }

    if (file.size > 15 * 1024 * 1024) {
        notice.textContent = "PDF must be smaller than 15 MB.";
        return;
    }

    busy = true;
    pdfUploaded = false;
    updateControls();
    notice.textContent = "";
    status.textContent = "Processing PDF...";

    const formData = new FormData();
    formData.append("pdf", file);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed.");
        }

        pdfUploaded = true;
        status.textContent = data.filename + " · " + data.chunks + " chunks";

        const welcome = document.getElementById("welcome");
        if (welcome) welcome.remove();

        addMessage(
            "Your PDF is ready! Ask me a question about its contents.",
            "assistant"
        );
    } catch (error) {
        status.textContent = "Upload failed";
        notice.textContent = error.message;
    } finally {
        busy = false;
        updateControls();
    }
});

// Send a question to Flask
async function askQuestion(question) {
    question = question.trim();

    if (!question || !pdfUploaded || busy) return;

    const welcome = document.getElementById("welcome");
    if (welcome) welcome.remove();

    addMessage(question, "user");

    questionInput.value = "";
    busy = true;
    updateControls();
    notice.textContent = "";

    const loading = addMessage(
        "Searching your PDF and generating an answer...",
        "assistant"
    );

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not generate an answer.");
        }

        loading.remove();
        addMessage(data.answer, "assistant", data.pages || []);
    } catch (error) {
        loading.remove();
        notice.textContent = error.message;
    } finally {
        busy = false;
        updateControls();
        questionInput.focus();
    }
}

// Handle question form submission
questionForm.addEventListener("submit", event => {
    event.preventDefault();
    askQuestion(questionInput.value);
});

// Update send button when the user types
questionInput.addEventListener("input", updateControls);

// Handle suggested questions
document.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("click", () => {
        if (pdfUploaded) {
            askQuestion(button.dataset.question);
        } else {
            notice.textContent = "Upload a PDF first.";
        }
    });
});

updateControls();
