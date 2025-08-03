// ปุ่มเปิด popup
$(function () {

// dxPopup
const popup = $("#changePasswordPopup").dxPopup({
  title: "Change Password",
  width: 400,
  height: "auto",
  showCloseButton: true,
  visible: false,
  contentTemplate: function () {
    return $("<div>").append(
      $("<div>").attr("id", "changePasswordForm")
    );
  },
  onShown: function () {
    // สร้าง dxForm เมื่อ popup แสดง
    $("#changePasswordForm").dxForm({
      formData: {
        oldPassword: "",
        newPassword: "",
      },
      items: [
        { dataField: "oldPassword", label: { text: "Current Password" }, editorType: "dxTextBox", editorOptions: { mode: "password" } },
        { dataField: "newPassword", label: { text: "New Password" }, editorType: "dxTextBox", editorOptions: { mode: "password" } },
        {
          itemType: "button",
          buttonOptions: {
            text: "Submit",
            type: "success",
            useSubmitBehavior: true,
            onClick: function () {
              const data = $("#changePasswordForm").dxForm("instance").option("formData");
              sendPasswordChange(data);
            }
          }
        }
      ]
    });
  }
}).dxPopup("instance");

// เรียก API
function sendPasswordChange(data) {
  const token = localStorage.getItem("token");
  fetch(BASE_URL + "/users/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((res) => {
      DevExpress.ui.notify(res.message, res.result === "success" ? "success" : "error", 2000);
      if (res.result === "success") popup.hide();
    })
    .catch((err) => {
      DevExpress.ui.notify("Something went wrong", "error", 2000);
    });
}
  popup.show();
});