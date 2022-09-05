if (_.isNull(getToken())) redirect("login.html");

const form = document.getElementById("form");
const previewBody = document.querySelector(".previews__body");

let data = [];

const previewBodyRender = (data, infiniti = false) => {
  if (!data.length) {
    previewBody.innerHTML = `<div class="previews__body__empty">No previews</div>`;
  }
  data.forEach(({ title, description, image, _id }, index) => {
    if (!index && !infiniti) previewBody.innerHTML = "";

    previewBody.innerHTML += `
    <div class="card" style="width: 18rem;">
  <img src="${image}" class="card-img-top card__img__top" alt="...">
  <div class="card-body">
    <h5 class="card-title">${title}</h5>
    <p class="card-text">${description}</p>
    <div className="d-flex">
      <button onclick="editCard('${_id}', ${index})" class="btn btn-outline-success">Edit</button>
      <button onclick="deleteCard('${_id}')" class="btn btn-outline-danger">Delete</button>
      <button onclick="copyTextToClipboard('${config.APP_URL}preview/v1/template/${_id}')" class="btn btn-outline-dark">Copy</button>
    </div>
  </div>
</div>
    `;
  });
};

const getPreviewAndRender = (infiniti = false) =>
  request({
    url: `${config.APP_URL}preview/v1/by-user`,
    method: "get",
    body: {},
    cb: {
      success: (res) => {
        data = _.get(res, "data", []);
        previewBodyRender(_.get(res, "data", [], infiniti));
      },
      fail: (e) => showError(e),
    },
  });

form.onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const fileType = _.get(data.get("file"), "type", "");

  if (fileType.startsWith("image")) {
    // const formProps = Object.fromEntries(data);
    let id = form.getAttribute("data-id");
    let index = form.getAttribute("data-index");

    if (id && index) {
      // edit
      request({
        url: `${config.APP_URL}preview/v1/update/${id}`,
        method: "put",
        body: data,
        cb: {
          success: (res) => {
            getPreviewAndRender();
            resetForm();
          },
          fail: (e) => showError(e),
        },
      });
    } else {
      // create
      request({
        url: `${config.APP_URL}preview/v1/create`,
        method: "post",
        body: data,
        cb: {
          success: (res) => {
            const templateUrl = `${config.APP_URL}preview/v1/template/${_.get(res, "data._id")}`;
            previewBodyRender([_.get(res, "data")], 1);
            alert(`link: ${templateUrl}`);
            form.reset();
          },
          fail: (e) => showError(e),
        },
      });
    }
  } else tostify({ status: "error", text: "Please send image file" });
};

const deleteCard = (id) => {
  request({
    url: `${config.APP_URL}preview/v1/delete/${id}`,
    method: "delete",
    body: {},
    cb: {
      success: (res) => {
        getPreviewAndRender();
      },
      fail: (e) => showError(e),
    },
  });
};

const editCard = (id, index) => {
  const preview = data[index];
  if (preview) {
    const form = document.getElementById("form");
    form.reset();
    form.setAttribute("data-id", id);
    form.setAttribute("data-index", index);

    form["title"].value = preview.title;
    form["description"].value = preview.description;
    form["link"].value = preview.link;
    fetch(preview.image)
      .then((res) => res.blob())
      .then((blob) => {
        let type = blob.type.split("/")[1];
        const file = new File([blob], `image.${type}`, { type: blob.type });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        form["file"].files = dataTransfer.files;
      });
    mainModalLabel.innerHTML = "Edit Preview";
    mainModalBtn.click();
  } else tostify({ status: "error", text: "Preview not found" });
};

const resetForm = () => {
  let form = document.getElementById("form");
  form.reset();
  form.removeAttribute("data-id");
  form.removeAttribute("data-index");
  mainModalLabel.innerHTML = "Create Preview";
};

const checkModal = () => {
  const modal = document.getElementById("mainModal");
  setTimeout(() => {
    console.log(modal.classList.contains("show"));
    if (modal.classList.contains("show")) {
    }
  }, 500);
};

getPreviewAndRender();
