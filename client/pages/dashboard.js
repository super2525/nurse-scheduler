$("#dashboard").dxResponsiveBox({
  rows: [{ ratio: 1 }],
  cols: [
    { ratio: 1 },
    { ratio: 1 },
    { ratio: 1 },
    { ratio: 1 },
  ],
  singleColumnScreen: "xs",  // เมื่อหน้าจอเล็ก (มือถือ) จะเปลี่ยนเป็นคอลัมน์เดียว
  items: [
    {
      row: 0, col: 0,
      itemTemplate: function() {
        // ตัวอย่าง Graph (ใช้ dxChart)
        return $("<div>").dxChart({
          dataSource: [
            { day: "Mon", value: 30 },
            { day: "Tue", value: 45 },
            { day: "Wed", value: 40 }
          ],
          commonSeriesSettings: {
            argumentField: "day",
            type: "line",
          },
          series: [{ valueField: "value", name: "Visitors" }],
          title: "Daily Visitors",
          legend: { visible: false }
        });
      }
    },
    { location: { row: 0, col: 0 }, text: "Dashboard", icon: "home" },
    { location: { row: 0, col: 1 }, text: "Next Shift", icon: "time" },
    { location: { row: 0, col: 2 }, text: "Notifications", icon: "message" },
    { location: { row: 0, col: 3 }, text: "Statistics", icon: "chart" },
  ],
  itemTemplate: function(data) {
    return $("<div>").css({
      padding: "20px",
      "text-align": "center",
      cursor: "pointer",
      "border-radius": "8px",
      background: "#f5f5f5",
      margin: "5px",
      "box-shadow": "0 2px 6px rgba(209, 18, 18, 0.1)",
      "user-select": "none",
    })
    .append(
    //   $("<div>").dxIcon({ icon: data.icon, size: 40 }).css("margin-bottom", "10px"),
      $("<div>").text(data.text).css({ "font-weight": "600", "font-size": "1.1rem" })
    );
  }
});
