  const BASE_URL = "http://127.0.0.1:3000/api";
  const IMG_URL = "http://127.0.0.1:3000";
$(function () {
  function showToast(type, message, duration = 2000) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Icon based on type
    const icons = {
      success: "✅",
      error: "❌",
      info: "ℹ️",
    };

    toast.innerHTML = `
    <span class="icon">${icons[type] || ""}</span>
    <span class="message">${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, duration);
  }

  function getToken() {
    return (
      localStorage.getItem("token") ||
      "eyJhbGciOiJIUzI1NiIsIn2QzZjdiNmI1ZmNmZSIsInVzZXJuYW1lIjoiZGQiLCJyb2xlIjoiTnVyc2UiLCJ"
    );
  }

  window.postByAxios = async function (functionName, params) {
    const token = getToken();
    

    const isFormData = params instanceof FormData;

    // ตรวจสอบให้ functionName ขึ้นต้นด้วย /
    if (functionName[0] !== "/") {
      functionName = "/" + functionName;
    }
    return axios({
      method: "POST",
      url: `${BASE_URL}${functionName}`,
      data: params,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
    })
      .then((res) => {
        
        return res.data;
      })
      .catch((err) => {
        console.error(
          `❌ POST ${functionName} failed:`,
          err.response?.data || err.message
        );
        showToast("error", `POST ${functionName} failed: ${err.message}`);
        throw err.response?.data || err;
      });
  };

  window.getByAxios = function (functionName, params) {
    const token = getToken();
    if (functionName[0] != "/") {
      functionName = "/" + functionName; // is it correct?
    }
    return axios({
      method: "GET",
      url: `${BASE_URL}${functionName}`,
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          `❌ GET ${functionName} failed:`,
          err.response?.data || err.message
        );
        throw err.response?.data || err;
      });
  };

  /*$("#view").load("./pages/inbox.html"); // first part to load */
  let $avatar;
  let isLogged = false;

  // Create Popup for Signup Form
  let signupFormData = {
    username: "",
    password: "",
    email: "",
    phone: "",
    role: "",
    avatar: "",
  };
  $preview = {};
  $("#signup-form").dxPopup({
    title: "Sign Up",
    visible: false,
    width: "60%",
    height: "auto",
    showCloseButton: true,
    dragEnabled: true,
    contentTemplate: function (contentElement) {
      contentElement.append($("<div id='form-container'>"));
      $("#form-container").dxForm({
        formData: signupFormData,
        labelLocation: "top",
        colCount: 2,
        items: [
          {
            dataField: "username",
            label: { text: "Username" },
            validationRules: [{ type: "required" }],
          },
          {
            dataField: "password",
            label: { text: "Password" },
            editorType: "dxTextBox",
            editorOptions: { mode: "password" },
            validationRules: [{ type: "required" }],
          },
          {
            dataField: "confirmPassword",
            label: { text: "Confirm Password" },
            editorType: "dxTextBox",
            editorOptions: { mode: "password" },
            validationRules: [
              { type: "required", message: "Please confirm your password" },
              {
                type: "custom",
                validationCallback: function (e) {
                  const form = $("#form-container").dxForm("instance");
                  const password = form.option("formData").password;
                  return e.value === password;
                },
                message: "Passwords do not match",
              },
            ],
          },
          {
            dataField: "email",
            label: { text: "Email" },
            editorType: "dxTextBox",
            validationRules: [{ type: "required" }, { type: "email" }],
          },
          {
            dataField: "phone",
            label: { text: "Phone Number" },
            editorType: "dxTextBox",
            validationRules: [
              {
                type: "pattern",
                pattern: /^[0-9]{10,}$/,
                message: "Enter valid phone number",
              },
            ],
          },
          {
            dataField: "role",
            label: { text: "Role" },
            editorType: "dxSelectBox",
            editorOptions: {
              items: ["Nurse", "Admin", "Manager"],
              placeholder: "Select a role",
            },
            validationRules: [{ type: "required" }],
          },
          {
            label: { text: "" },
            template: function (data, itemElement) {
              $preview = $("<img>")
                .css({
                  width: "100px",
                  height: "100px",
                  marginTop: "10px",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                  borderRadius: "51%",
                })
                .hide() // ซ่อนจนกว่าจะมีไฟล์
                .appendTo(itemElement);
            },
          },
          {
            dataField: "avatar",
            label: { text: "" },
            template: function (data, itemElement) {
              $("<div>")
                .appendTo(itemElement)
                .dxFileUploader({
                  multiple: false,
                  accept: "image/*",
                  uploadMode: "useForm",
                  onValueChanged: function (e) {
                    const file = e.value[0];

                    if (file && file.size > 2 * 1024 * 1024) {
                      DevExpress.ui.notify(
                        "File size exceeds 2MB",
                        "error",
                        2000
                      );
                      signupFormData.avatarFile = null;
                    } else {
                      signupFormData.avatarFile = file;

                      if (file) {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                          $preview.attr("src", event.target.result).show();
                        };
                        reader.readAsDataURL(file);
                      } else {
                        $preview.hide();
                      }
                    }
                  },
                });
            },
          },
          {
            itemType: "group",
          },
          {
            itemType: "button",
            horizontalAlignment: "center",
            buttonOptions: {
              text: "Submit",
              type: "default",
              useSubmitBehavior: false,
              onClick: function () {
                const form = $("#form-container").dxForm("instance");
                const result = form.validate();
                if (result.isValid) {
                  const data = form.option("formData");

                  // สร้าง FormData สำหรับส่งไป backend
                  const formDataToSend = new FormData();
                  formDataToSend.append("username", data.username);
                  formDataToSend.append("password", data.password);
                  formDataToSend.append("email", data.email);
                  formDataToSend.append("phone", data.phone);
                  formDataToSend.append("role", data.role);

                  if (data.avatarFile) {
                    formDataToSend.append("avatar", data.avatarFile);
                  }
                  const token = getToken();
                  const isFormData = formDataToSend instanceof FormData;

                  axios
                    .post(`${BASE_URL}/users/signup`, formDataToSend, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": isFormData
                          ? "multipart/form-data"
                          : "application/json",
                      },
                    })
                    .then((res) => {
                      console.log("resCont Data:", res);
                      res = res.data;
                      if (res.result === "success") {
                        showToast(
                          "success",
                          "Signup successful! Please login.",
                          2000
                        );
                        $("#signup-form").dxPopup("instance").hide();
                      } else {
                        showToast("info", res.message || "Signup failed", 3000);
                      }
                    })
                    .catch((err) => {
                      console.error("Signup error:", err);
                      showToast("error", "Signup failed: " + err.message, 3000);
                    });
                }
              },
            },
          },
        ],
      });
    },
  });

  function showSignupPopup() {
    $("#signup-form").dxPopup("instance").show();
  }

  const drawer = $("#drawer").dxDrawer({
      minSize: 37,
      height: 400,
      revealMode: "expand",
      openedStateMode: "overlap",
      template: function () {
        const $list = $("<div/>").dxList({
          items: [
            {
              id: 1,
              text: "Dashboard",
              icon: "mediumiconslayout",
              filePath: "dashboard",
            },
            {
              id: 2,
              text: "System Seetings",
              icon: "checklist",
              filePath: "systemconfig",
            }
          ],
          width: 200,
          selectionMode: "single",
          onSelectionChanged: function (e) {
            if (e.addedItems[0].id > 0) {
              // try to get listitems index
              $("#view").load(
                "./pages/" + e.addedItems[0].filePath + ".html",
                function () {
                  $.getScript("./pages/" + e.addedItems[0].filePath + ".js");
                }
              );

              drawer.hide();
            }
          },
        });
        return $list;
      },
    })
    .dxDrawer("instance");

  $("#toolbar").dxToolbar({
    items: [
      {
        location: "before",
        widget: "dxButton",
        options: {
          icon: "menu",
          onClick: function () {
            drawer.toggle();
          },
        },
      },
      {
        location: "after",
        widget: "dxDropDownButton",
        options: {
          text: "Account",
          icon: "user",
          items: [
            { id: 1, name: "Login" },
            { id: 2, name: "Signup" },
          ],
          displayExpr: "name",
          keyExpr: "id",
          onItemClick: function (e) {
            if (e.itemData.name === "Signup") {
              showSignupPopup();
            } else {
              showLoginPopup();
            }
          },
        },
      },
    ],
  });
  const loginFormData = {
    username: "",
    password: "",
  };

  $("#login-form")
    .dxPopup({
      title: "Login",
      visible: false,
      width: "60%",
      height: "auto",
      showCloseButton: true,
      dragEnabled: true,
      contentTemplate: function (contentElement) {
        contentElement.append($("<div id='login-container'>"));
        $("#login-container").dxForm({
          formData: loginFormData,
          labelLocation: "top",
          items: [
            {
              dataField: "username",
              label: { text: "Username" },
              validationRules: [{ type: "required" }],
            },
            {
              dataField: "password",
              label: { text: "Password" },
              editorType: "dxTextBox",
              editorOptions: { mode: "password" },
              validationRules: [{ type: "required" }],
            },
            {
              itemType: "button",
              horizontalAlignment: "center",
              buttonOptions: {
                text: "Login",
                type: "default",
                onClick: function () {
                  const form = $("#login-container").dxForm("instance");
                  const result = form.validate();
                  if (result.isValid) {
                    const data = form.option("formData");
                    try {
                      postByAxios("/users/authenticate",form.option("formData")
                      ).then((res) => {
                        
                        if (res.result === "success") {
                        // ✅ Save token to localStorage
                        localStorage.setItem("token", res.token);

                        updateAccountButton({
                          username: data.username,
                          avatar: res.avatar,
                        });

                        DevExpress.ui.notify(
                          { message: "Login successful!", type: "success" },
                          { position: "center", direction: "up-push" }
                        );

                        $("#login-form").dxPopup("instance").hide();
                      } else {

                        DevExpress.ui.notify(
                          { message: res.message, type: "warning" },
                          { position: "center", direction: "up-push" }
                        );
                      }
                      });
                    } catch (err) {
                      DevExpress.ui.notify(
                        "Invalid username or password",
                        "error",
                        3000
                      );
                    }
                  }
                },
              },
            },
          ],
        });
      },
    })
    .dxPopup("instance");

  function showLoginPopup() {
    try {
      $("#login-form").dxPopup("instance").show();
    } catch {
      console.log("login Data: ");
    }
  }

  function updateAccountButton(userInfo) {
    const avatarUrl = userInfo.avatar || "default-avatar.png";
    const src = IMG_URL + avatarUrl;

    const toolbar = $("#toolbar").dxToolbar("instance");

    // 🔁 เคลียร์ items ด้านขวาทั้งหมดก่อนใส่ใหม่ (เฉพาะส่วน after)
    toolbar.option(
      "items",
      toolbar.option("items").filter((item) => item.location !== "after")
    );

    // ✅ เพิ่ม Avatar (ก่อนปุ่ม)
    toolbar.option("items").push({
      location: "after",
      template: function () {
        return $("<img>").attr("src", src).css({
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          marginRight: "10px",
        });
      },
    });

    // ✅ ตามด้วย dxDropDownButton
    toolbar.option("items").push({
      location: "after",
      widget: "dxDropDownButton",
      options: {
        text: userInfo.username,
        stylingMode: "text",
        displayExpr: "name",
        keyExpr: "id",
        width: 150,
        items: [
          { id: 1, name: "Profile" },
          { id: 2, name: "Settings" },
          { id: 3, name: "Change Password"},
          { id: 4, name: "Logout" },
        ],
        onItemClick: function (e) {
          if (e.itemData.name === "Logout") {
            localStorage.removeItem("token");
            location.reload();
          } else if (e.itemData.id === 3) {
            $("#view").load("./pages/changepassword.html", function () {
              $.getScript("./pages/changepassword.js");
            });
          } else {
            $("#view").load("./pages/"+e.itemData.name+".html", function () {
              $.getScript("./pages/"+e.itemData.name+".js");
            });
          }
        },
      },
    });

    // 🔄 อัปเดต toolbar ทั้งหมด
    toolbar.repaint();
  }
});
