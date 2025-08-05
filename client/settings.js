import { getUserConfig, saveUserConfig } from '../apiservice.js';

$(async function () {
  const result = await getUserConfig();

  if (result?.error) {
    $('#status-message').text(`Error: ${result.message}`);
    return;
  }

  const userData = result.data || {};

  $('#settings-form').dxForm({
    formData: userData.settings || {},
    items: [
      { dataField: 'ward', label: { text: 'Ward' } },
      { dataField: 'worktype', label: { text: 'Work Type' } },
      { dataField: 'overtimeRate', label: { text: 'Overtime Rate' } },
      { dataField: 'overtimeType', label: { text: 'Overtime Type' } },
      { dataField: 'specialShiftRate', label: { text: 'Special Shift Rate' } },
      { dataField: 'shiftPerMonth', label: { text: 'Shift Per Month' } },
      { dataField: 'selectableShiftCode', label: { text: 'Selectable Shift Code' }, editorType: 'dxTagBox' }
    ],
    colCount: 1,
    showColonAfterLabel: true,
    labelLocation: 'top',
    onContentReady: function (e) {
      const $button = $('<div id="save-button"/>').dxButton({
        text: 'Save',
        type: 'success',
        onClick: async () => {
          const formData = e.component.option('formData');
          const saveResult = await saveUserConfig({
            token: localStorage.getItem('token'), // หรือเว้นว่างได้ถ้าไม่ต้องเก็บ
            settings: formData
          });

          if (saveResult?.error) {
            DevExpress.ui.notify(`Save failed: ${saveResult.message}`, 'error');
          } else {
            DevExpress.ui.notify('Saved successfully!', 'success');
          }
        }
      });
      e.element.append($button);
    }
  });
});
