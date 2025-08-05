//apiService.js
apiService = {
  getUserConfig: async function () {
    console.log("Getting user config...");
    const token = localStorage.getItem("token");
    const response = await fetch(BASE_URL + "/userconfig/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  saveUserConfig: async function (data) {
    const token = localStorage.getItem("token");
    const response = await fetch(BASE_URL + "/userconfig/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  itemOfShift: async function (data) {
    const token = localStorage.getItem("token");
    const response = await fetch(BASE_URL + "/systemconfig/list/ShiftCode", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  getUserInfo: async function (data){
    
  }
};
