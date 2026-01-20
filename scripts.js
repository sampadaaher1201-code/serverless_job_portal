const API = "https://lyn4gggc01.execute-api.us-east-1.amazonaws.com/dev";

/* ================= LOAD JOBS ================= */
function getJobs() {
  fetch(API + "/jobs")
    .then(res => res.json())
    .then(data => {
      let html = "";

      data.forEach(j => {
        html += `
          <div class="job">
            <b>${j.title}</b><br>
            ${j.company}<br>
            ${j.location}<br>
            ${j.description}
          </div>
        `;
      });

      document.getElementById("jobs").innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      alert("Failed to load jobs");
    });
}


/* ================= UPLOAD RESUME + FORM ================= */
function uploadResume() {

  const name = document.getElementById("name").value;
  const mobile = document.getElementById("mobile").value;
  const address = document.getElementById("address").value;
  const year = document.getElementById("year").value;
  const declaration = document.getElementById("decl").checked;
  const file = document.getElementById("resume").files[0];

  if (!name || !mobile || !address || !year || !file || !declaration) {
    alert("Please fill all fields and accept declaration");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const base64File = reader.result.split(",")[1];

    fetch(API + "/uploadResume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        mobile: mobile,
        address: address,
        passout: year,
        declaration: declaration,
        fileName: file.name,
        file: base64File
      })
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById("msg").innerText = "✅ Application submitted successfully";
      document.getElementById("msg").style.color = "green";
      console.log(data);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("msg").innerText = "❌ Upload failed";
      document.getElementById("msg").style.color = "red";
    });
  };

  reader.readAsDataURL(file);
}
