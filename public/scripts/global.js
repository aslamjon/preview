const config = {
  APP_URL: "http://localhost:8989/api/",
  APP_URL: "http://ec2-18-222-127-242.us-east-2.compute.amazonaws.com/api/",
};
const setLocalStorage = (key, value) => window.localStorage.setItem(key, value);
const getLocalStorage = (key) => window.localStorage.getItem(key);

const getToken = () => getLocalStorage("accessToken");
const setToken = (token) => setLocalStorage("accessToken", token);
const clearToken = () => {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.localStorage.removeItem("tokenType");
};

const redirect = (url) => (window.location.href = url);

const tostify = ({ status = "info", ...props } = {}) => {
  Toastify({
    text: "This is a toast",
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background:
        status === "info"
          ? "linear-gradient(to right, #00b09b, #96c93d)"
          : status === "error"
          ? "linear-gradient(to top, #d11919, #ff4848)"
          : status === "success"
          ? "linear-gradient(to top, #00904b, #18ba6c)"
          : status === "warning"
          ? "linear-gradient(to top, #f2d27b, #ff901d)"
          : "red",
    },
    onClick: function () {}, // Callback after click
    ...props,
  }).showToast();
};

const showError = (e) => tostify({ status: "error", text: _.get(e, "response.data.message") });

async function request({ url, method = "get", body = {}, cb: { success = () => "", fail = () => "" } = {} }) {
  try {
    method = method.toLowerCase();
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${getLocalStorage("tokenType")} ${getToken()}`,
      },
    };
    let response = {};
    if (method === "get" || method === "delete") response = await axios[method](url, axiosConfig);
    else response = await axios[method](url, body, axiosConfig);
    success(_.get(response, "data", {}), response);
  } catch (error) {
    fail(error);
    if (error.response.status === 401) {
      clearToken();
      redirect("/login.html");
    }
    console.error(error);
  }
}

const logout = () => {
  clearToken();
  redirect("/login.html");
};

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    // var msg = successful ? 'successful' : 'unsuccessful';
    // console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      // console.log('Async: Copying to clipboard was successful!');
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}
// tostify();
