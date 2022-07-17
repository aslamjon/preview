if (!_.isNull(getToken())) redirect("/");

const form = document.getElementById("form");
form.onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const formProps = Object.fromEntries(data);
  request({
    url: `${config.APP_URL}auth/v1/auth/sign-in`,
    method: "post",
    body: formProps,
    cb: {
      success: (res) => {
        for (const key in res) {
          setLocalStorage(key, res[key]);
        }
        window.location.href = "/";
      },
      fail: (e) => showError(e),
    },
  });
  e;
};
