// ===============================
// STUDENT DASHBOARD JAVASCRIPT
// ===============================

// 🔹 API Gateway base URL
const apiUrl = "https://lyn4gggc01.execute-api.us-east-1.amazonaws.com/prod";

/**
 * Load available jobs
 */
function getJobs() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const jobs = document.getElementById("jobs");
            jobs.innerHTML = "";

            data.forEach(job => {
                // ✅ SAFELY pick job title
                const title = job.jobTitle || job.title || "Unknown Job";

                jobs.innerHTML += `
                    <li>
                        <b>${title}</b> - ${job.company || "N/A"}<br>
                        ${job.description || ""}<br><br>

                        <button onclick="selectJob('${title.replace(/'/g, "\\'")}')">
                            Apply
                        </button>
                    </li>
                `;
            });
        })
        .catch(err => {
            console.error("Load jobs error:", err);
            alert("Unable to load jobs");
        });
}


/**
 * Auto-fill job title when Apply button is clicked
 */
function selectJob(title) {
    const jobTitleInput = document.getElementById("jobTitle");
    if (!jobTitleInput) return;

    jobTitleInput.value = title;

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}

/**
 * Upload resume to S3 via Lambda (BASE64 JSON)
 */
async function uploadResume(file) {
    const base64File = await toBase64(file);

    const response = await fetch(apiUrl + "/uploadResume", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            file: base64File,
            fileName: file.name
        })
    });

    if (!response.ok) {
        throw new Error("Resume upload failed");
    }

    const data = await response.json();
    console.log("Resume uploaded:", data.resumeLink);
    return data.resumeLink;
}

/**
 * Convert file to base64
 */
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = error => reject(error);
    });
}

/**
 * Apply for a job
 */
async function apply() {
    const jobTitle = document.getElementById("jobTitle").value;
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const resumeInput = document.getElementById("resume");
    const status = document.getElementById("uploadStatus");

    if (!jobTitle) {
        alert("⚠️ Please click Apply on a job first");
        return;
    }

    if (!fullName || !email || resumeInput.files.length === 0) {
        alert("⚠️ Please fill all fields and upload resume");
        return;
    }

    try {
        status.innerText = "⏳ Uploading resume...";

        const resumeFile = resumeInput.files[0];
        const resumeLink = await uploadResume(resumeFile);

        status.innerText = "⏳ Submitting application...";

        const response = await fetch(apiUrl + "/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jobTitle,
                fullName,
                email,
                resumeLink
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Application failed");
        }

        status.innerText = "✅ Job application submitted successfully";

        // Reset fields (keep job title)
        document.getElementById("fullName").value = "";
        document.getElementById("email").value = "";
        resumeInput.value = "";

    } catch (err) {
        console.error("Apply error:", err);
        status.innerText = "❌ Job application failed";
        alert(err.message);
    }
}

/**
 * Load jobs on page load
 */
window.onload = function () {
    if (document.getElementById("jobs")) {
        getJobs();
    }
};
